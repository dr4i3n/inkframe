export type DeviceType = 'X3' | 'X4';
export type FitMode = 'cover' | 'contain';
export type BackgroundFill = 'black' | 'white' | 'mirror';
export type DitherMode = 'none' | 'floyd' | 'atkinson' | 'bayer';

export interface DeviceConfig {
  width: number;
  height: number;
}

export const DEVICES: Record<DeviceType, DeviceConfig> = {
  X3: { width: 528, height: 792 },
  X4: { width: 480, height: 800 },
};

/** Global processing options shared by every image in the batch. */
export interface GlobalOptions {
  device: DeviceType;
  fitMode: FitMode;
  invert: boolean;
  brightness: number; // -100..100
  contrast: number; // -100..100
  gamma: number; // 0.4..2.6, 1 = neutral
  autoLevels: boolean; // histogram stretch
  grayLevels: number; // 2 | 4 | 16 | 256
  ditherMode: DitherMode;
  backgroundFill: BackgroundFill;
  bitDepth: 8 | 24;
}

/** Per-image framing. Each uploaded image keeps its own transform. */
export interface Adjust {
  scale: number; // percent
  panX: number;
  panY: number;
  rotate: number; // 0 | 90 | 180 | 270
}

export const DEFAULT_ADJUST: Adjust = { scale: 100, panX: 0, panY: 0, rotate: 0 };

export interface ProcessedImage {
  id: string;
  originalName: string;
  dataUrl: string; // processed PNG for live preview
  originalUrl: string; // framed but unprocessed PNG (before/after)
  bmpBlob: Blob; // BMP for download
  byteSize: number;
  width: number;
  height: number;
}

export function bmpByteSize(width: number, height: number, bitDepth: 8 | 24): number {
  if (bitDepth === 8) {
    const rowSize = Math.floor((width + 3) / 4) * 4;
    return 54 + 256 * 4 + rowSize * height;
  }
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  return 54 + rowSize * height;
}

function encodeBMP(imageData: ImageData, bitDepth: 8 | 24 = 24): Blob {
  const width = imageData.width;
  const height = imageData.height;

  if (bitDepth === 8) {
    const rowSize = Math.floor((width + 3) / 4) * 4;
    const pixelArraySize = rowSize * height;
    const paletteSize = 256 * 4;
    const offset = 54 + paletteSize;
    const fileSize = offset + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4d);
    view.setUint32(2, fileSize, true);
    view.setUint32(10, offset, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 8, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 256, true);
    view.setUint32(50, 256, true);

    for (let i = 0; i < 256; i++) {
      const idx = 54 + i * 4;
      view.setUint8(idx, i);
      view.setUint8(idx + 1, i);
      view.setUint8(idx + 2, i);
      view.setUint8(idx + 3, 0);
    }

    const data = imageData.data;
    const pixels = new Uint8Array(buffer, offset);
    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      const dstOffset = y * rowSize;
      for (let x = 0; x < width; x++) {
        pixels[dstOffset + x] = data[(srcRow * width + x) * 4];
      }
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }

  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);

  const data = imageData.data;
  const pixels = new Uint8Array(buffer, 54);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    const dstOffset = y * rowSize;
    for (let x = 0; x < width; x++) {
      const srcPx = (srcRow * width + x) * 4;
      const dstPx = dstOffset + x * 3;
      pixels[dstPx] = data[srcPx + 2];
      pixels[dstPx + 1] = data[srcPx + 1];
      pixels[dstPx + 2] = data[srcPx];
    }
  }
  return new Blob([buffer], { type: 'image/bmp' });
}

function rotateSource(img: HTMLImageElement, rotate: number): { source: CanvasImageSource; w: number; h: number } {
  const rot = ((rotate % 360) + 360) % 360;
  if (rot === 0) return { source: img, w: img.width, h: img.height };
  const swap = rot === 90 || rot === 270;
  const w = swap ? img.height : img.width;
  const h = swap ? img.width : img.height;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const rc = c.getContext('2d')!;
  rc.translate(w / 2, h / 2);
  rc.rotate((rot * Math.PI) / 180);
  rc.drawImage(img, -img.width / 2, -img.height / 2);
  return { source: c, w, h };
}

// 4x4 Bayer threshold matrix (normalized to -0.5..0.5).
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(row => row.map(v => (v + 0.5) / 16 - 0.5));

interface RenderResult {
  processed: ImageData;
  original: ImageData;
}

function renderImageData(img: HTMLImageElement, options: GlobalOptions, adjust: Adjust): RenderResult {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const { width, height } = DEVICES[options.device];
  canvas.width = width;
  canvas.height = height;

  const { source, w: sw, h: sh } = rotateSource(img, adjust.rotate);
  const imgAspect = sw / sh;
  const canvasAspect = width / height;

  let drawW = width;
  let drawH = height;
  if (options.fitMode === 'cover') {
    if (imgAspect > canvasAspect) { drawH = height; drawW = sw * (height / sh); }
    else { drawW = width; drawH = sh * (width / sw); }
  } else {
    if (imgAspect > canvasAspect) { drawW = width; drawH = sh * (width / sw); }
    else { drawH = height; drawW = sw * (height / sh); }
  }

  const scaleMultiplier = (adjust.scale ?? 100) / 100;
  drawW *= scaleMultiplier;
  drawH *= scaleMultiplier;

  const offsetX = (width - drawW) / 2 + (adjust.panX || 0);
  const offsetY = (height - drawH) / 2 + (adjust.panY || 0);

  if (options.backgroundFill !== 'mirror') {
    ctx.fillStyle = options.backgroundFill === 'black' ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  if (options.backgroundFill === 'mirror') {
    const startCol = Math.floor(-offsetX / drawW);
    const endCol = Math.floor((width - offsetX) / drawW);
    const startRow = Math.floor(-offsetY / drawH);
    const endRow = Math.floor((height - offsetY) / drawH);
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const x = offsetX + col * drawW;
        const y = offsetY + row * drawH;
        const flipX = Math.abs(col) % 2 === 1;
        const flipY = Math.abs(row) % 2 === 1;
        ctx.save();
        ctx.translate(x + (flipX ? drawW : 0), y + (flipY ? drawH : 0));
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(source, 0, 0, drawW, drawH);
        ctx.restore();
      }
    }
  } else {
    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  }

  // Snapshot the framed (unprocessed) image for before/after.
  const original = ctx.getImageData(0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const n = width * height;
  const gray = new Float32Array(n);

  for (let i = 0, p = 0; p < n; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Auto-levels: stretch the 0.5–99.5 percentile range to full 0–255.
  if (options.autoLevels) {
    const hist = new Uint32Array(256);
    for (let p = 0; p < n; p++) hist[Math.max(0, Math.min(255, gray[p] | 0))]++;
    const clip = n * 0.005;
    let lo = 0, hi = 255, acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > clip) { lo = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > clip) { hi = v; break; } }
    if (hi > lo) {
      const range = hi - lo;
      for (let p = 0; p < n; p++) gray[p] = ((gray[p] - lo) / range) * 255;
    }
  }

  // Brightness / contrast / gamma.
  const brightness = (options.brightness || 0) * 1.28;
  const c = (options.contrast || 0) * 2.55;
  const contrastFactor = (259 * (c + 255)) / (255 * (259 - c));
  const gamma = options.gamma && options.gamma > 0 ? options.gamma : 1;
  const invGamma = 1 / gamma;
  const applyGamma = gamma !== 1;

  for (let p = 0; p < n; p++) {
    let v = contrastFactor * (gray[p] - 128) + 128 + brightness;
    if (applyGamma) {
      const nv = v < 0 ? 0 : v > 255 ? 255 : v;
      v = 255 * Math.pow(nv / 255, invGamma);
    }
    if (options.invert) v = 255 - v;
    gray[p] = v;
  }

  // Quantize to grayLevels using the selected dithering mode.
  const levels = Math.max(2, Math.min(256, options.grayLevels || 256));
  const step = 255 / (levels - 1);
  const quant = (v: number) => {
    const q = Math.round(v / step) * step;
    return q < 0 ? 0 : q > 255 ? 255 : q;
  };

  if (options.ditherMode === 'floyd' || options.ditherMode === 'atkinson') {
    const atkinson = options.ditherMode === 'atkinson';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldV = gray[idx];
        const newV = quant(oldV);
        gray[idx] = newV;
        const err = oldV - newV;
        if (atkinson) {
          const e = err / 8;
          if (x + 1 < width) gray[idx + 1] += e;
          if (x + 2 < width) gray[idx + 2] += e;
          if (y + 1 < height) {
            if (x - 1 >= 0) gray[idx + width - 1] += e;
            gray[idx + width] += e;
            if (x + 1 < width) gray[idx + width + 1] += e;
          }
          if (y + 2 < height) gray[idx + 2 * width] += e;
        } else {
          if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
          if (y + 1 < height) {
            if (x - 1 >= 0) gray[idx + width - 1] += (err * 3) / 16;
            gray[idx + width] += (err * 5) / 16;
            if (x + 1 < width) gray[idx + width + 1] += (err * 1) / 16;
          }
        }
      }
    }
  } else if (options.ditherMode === 'bayer') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        gray[idx] = quant(gray[idx] + BAYER4[y & 3][x & 3] * step);
      }
    }
  } else {
    for (let p = 0; p < n; p++) gray[p] = quant(gray[p]);
  }

  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const v = gray[p] < 0 ? 0 : gray[p] > 255 ? 255 : gray[p];
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return { processed: imageData, original };
}

export const processImage = async (
  file: File,
  options: GlobalOptions,
  adjust: Adjust,
): Promise<Omit<ProcessedImage, 'id'>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { width, height } = DEVICES[options.device];
        const { processed, original } = renderImageData(img, options, adjust);
        const bmpBlob = encodeBMP(processed, options.bitDepth);

        const mk = (data: ImageData) => {
          const cv = document.createElement('canvas');
          cv.width = width;
          cv.height = height;
          cv.getContext('2d')!.putImageData(data, 0, 0);
          return cv.toDataURL('image/png');
        };

        resolve({
          originalName: file.name,
          dataUrl: mk(processed),
          originalUrl: mk(original),
          bmpBlob,
          byteSize: bmpBlob.size,
          width,
          height,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Processing failed'));
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
};
