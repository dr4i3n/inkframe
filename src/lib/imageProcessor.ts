export type DeviceType = 'X3' | 'X4';
export type FitMode = 'cover' | 'contain';
export type BackgroundFill = 'black' | 'white' | 'mirror';

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
  dither: boolean;
  backgroundFill: BackgroundFill;
  bitDepth: 8 | 24;
  brightness: number; // -100..100
  contrast: number; // -100..100
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
  dataUrl: string; // PNG for live preview
  bmpBlob: Blob; // BMP for download
  byteSize: number; // size of the BMP in bytes
  width: number;
  height: number;
}

/** Deterministic BMP file size from dimensions + bit depth (no encoding needed). */
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

    // BMP header
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4d); // 'M'
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, offset, true);

    // DIB header (40 bytes)
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true); // Color planes
    view.setUint16(28, 8, true); // Bits per pixel
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 256, true); // Colors in color table
    view.setUint32(50, 256, true); // Important color count

    // Grayscale palette
    for (let i = 0; i < 256; i++) {
      const idx = 54 + i * 4;
      view.setUint8(idx, i); // B
      view.setUint8(idx + 1, i); // G
      view.setUint8(idx + 2, i); // R
      view.setUint8(idx + 3, 0); // Reserved
    }

    const data = imageData.data;
    const pixels = new Uint8Array(buffer, offset);

    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      const dstOffset = y * rowSize;
      for (let x = 0; x < width; x++) {
        const srcPx = (srcRow * width + x) * 4;
        pixels[dstOffset + x] = data[srcPx]; // grayscale: R=G=B
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }

  // 24-bit encoding
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 54, true);

  // DIB header (40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const data = imageData.data;
  const pixels = new Uint8Array(buffer, 54);

  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // bottom-up
    const dstOffset = y * rowSize;
    for (let x = 0; x < width; x++) {
      const srcPx = (srcRow * width + x) * 4;
      const dstPx = dstOffset + x * 3;
      pixels[dstPx] = data[srcPx + 2]; // B
      pixels[dstPx + 1] = data[srcPx + 1]; // G
      pixels[dstPx + 2] = data[srcPx]; // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/** Render the source rotated onto an offscreen canvas so the rest of the
 *  pipeline can treat it as a plain image with swapped dimensions. */
function rotateSource(
  img: HTMLImageElement,
  rotate: number,
): { source: CanvasImageSource; w: number; h: number } {
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

function renderImageData(img: HTMLImageElement, options: GlobalOptions, adjust: Adjust): ImageData {
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
    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = sw * (height / sh);
    } else {
      drawW = width;
      drawH = sh * (width / sw);
    }
  } else {
    if (imgAspect > canvasAspect) {
      drawW = width;
      drawH = sh * (width / sw);
    } else {
      drawH = height;
      drawW = sw * (height / sh);
    }
  }

  const scaleMultiplier = (adjust.scale ?? 100) / 100;
  drawW *= scaleMultiplier;
  drawH *= scaleMultiplier;

  const panX = adjust.panX || 0;
  const panY = adjust.panY || 0;
  const offsetX = (width - drawW) / 2 + panX;
  const offsetY = (height - drawH) / 2 + panY;

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

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Brightness / contrast factors.
  const brightness = (options.brightness || 0) * 1.28; // -128..128
  const c = (options.contrast || 0) * 2.55; // -255..255
  const contrastFactor = (259 * (c + 255)) / (255 * (259 - c));

  // Grayscale buffer (float, so dithering keeps full precision).
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    let g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    g = contrastFactor * (g - 128) + 128 + brightness;
    if (options.invert) g = 255 - g;
    gray[p] = g; // left unclamped for accurate error diffusion
  }

  if (options.dither) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldPixel = gray[idx];
        const newPixel = oldPixel < 128 ? 0 : 255;
        gray[idx] = newPixel;
        const err = oldPixel - newPixel;

        if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
        if (y + 1 < height) {
          if (x - 1 >= 0) gray[idx + width - 1] += (err * 3) / 16;
          gray[idx + width] += (err * 5) / 16;
          if (x + 1 < width) gray[idx + width + 1] += (err * 1) / 16;
        }
      }
    }
  }

  // Write back, clamping once at the end.
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    const v = gray[p] < 0 ? 0 : gray[p] > 255 ? 255 : gray[p];
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return imageData;
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
        const imageData = renderImageData(img, options, adjust);
        const bmpBlob = encodeBMP(imageData, options.bitDepth);

        // Preview PNG via a throwaway canvas.
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = width;
        previewCanvas.height = height;
        previewCanvas.getContext('2d')!.putImageData(imageData, 0, 0);

        resolve({
          originalName: file.name,
          dataUrl: previewCanvas.toDataURL('image/png'),
          bmpBlob,
          byteSize: bmpBlob.size,
          width,
          height,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Processing failed'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};
