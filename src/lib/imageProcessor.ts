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

export interface ProcessOptions {
  device: DeviceType;
  fitMode: FitMode;
  invert: boolean;
  dither: boolean;
  scale: number;
  panX: number;
  panY: number;
  backgroundFill?: BackgroundFill;
  bitDepth?: 8 | 24;
}

export interface ProcessedImage {
  id: string;
  originalName: string;
  dataUrl: string; // PNG for live preview
  bmpDataUrl: string; // BMP for download
}

function encodeBMP(imageData: ImageData, bitDepth: 8 | 24 = 24): string {
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

    // 1. BMP Header
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, offset, true);

    // 2. DIB Header (40 bytes)
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

    // Color table (Grayscale)
    for (let i = 0; i < 256; i++) {
      const idx = 54 + i * 4;
      view.setUint8(idx, i);     // B
      view.setUint8(idx + 1, i); // G
      view.setUint8(idx + 2, i); // R
      view.setUint8(idx + 3, 0); // Reserved
    }

    // 3. Pixel data
    const data = imageData.data;
    const pixels = new Uint8Array(buffer, offset);

    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      const dstOffset = y * rowSize;
      
      for (let x = 0; x < width; x++) {
        const srcPx = (srcRow * width + x) * 4;
        // Since it's grayscale, R=G=B, just pick one (R)
        pixels[dstOffset + x] = data[srcPx]; 
      }
    }

    const blob = new Blob([buffer], { type: 'image/bmp' });
    return URL.createObjectURL(blob);
  }

  // 24-bit encoding
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // 1. BMP Header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Pixel data offset

  // 2. DIB Header (40 bytes)
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel (24)
  view.setUint32(30, 0, true); // Compression (0 = none)
  view.setUint32(34, pixelArraySize, true); // Image size
  view.setInt32(38, 2835, true); // Horizontal resolution
  view.setInt32(42, 2835, true); // Vertical resolution
  view.setUint32(46, 0, true); // Colors in color table
  view.setUint32(50, 0, true); // Important color count

  // 3. Pixel data
  const data = imageData.data;
  const pixels = new Uint8Array(buffer, 54);

  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // Bottom-up
    const dstOffset = y * rowSize;

    for (let x = 0; x < width; x++) {
      const srcPx = (srcRow * width + x) * 4;
      const dstPx = dstOffset + x * 3;
      
      // BMP is BGR order
      pixels[dstPx] = data[srcPx + 2];     // B
      pixels[dstPx + 1] = data[srcPx + 1]; // G
      pixels[dstPx + 2] = data[srcPx];     // R
    }
  }

  const blob = new Blob([buffer], { type: 'image/bmp' });
  return URL.createObjectURL(blob);
}

export const processImage = async (file: File, options: ProcessOptions): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));

      const { width, height } = DEVICES[options.device];
      canvas.width = width;
      canvas.height = height;

      // Calculate drawing dimensions based on fitMode
      let drawW = width;
      let drawH = height;

      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      if (options.fitMode === 'cover') {
        if (imgAspect > canvasAspect) {
          drawH = height;
          drawW = img.width * (height / img.height);
        } else {
          drawW = width;
          drawH = img.height * (width / img.width);
        }
      } else { // contain
        if (imgAspect > canvasAspect) {
          drawW = width;
          drawH = img.height * (width / img.width);
        } else {
          drawH = height;
          drawW = img.width * (height / img.height);
        }
      }

      // Apply scale
      const scaleMultiplier = (options.scale ?? 100) / 100;
      drawW *= scaleMultiplier;
      drawH *= scaleMultiplier;

      // Center image and apply pan offsets
      const panX = options.panX || 0;
      const panY = options.panY || 0;
      const offsetX = (width - drawW) / 2 + panX;
      const offsetY = (height - drawH) / 2 + panY;

      // Handle background fill
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
            ctx.drawImage(img, 0, 0, drawW, drawH);
            ctx.restore();
          }
        }
      } else {
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }

      // Process pixels
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // First pass: grayscale and invert
      for (let i = 0; i < data.length; i += 4) {
        // Luminance formula
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (options.invert) {
          gray = 255 - gray;
        }
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Optional: Dithering (Floyd-Steinberg for pure B&W effect)
      if (options.dither) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const oldPixel = data[idx];
            // Threshold at 128
            const newPixel = oldPixel < 128 ? 0 : 255;
            data[idx] = newPixel;
            data[idx + 1] = newPixel;
            data[idx + 2] = newPixel;
            
            const quantError = oldPixel - newPixel;

            const distributeError = (ox: number, oy: number, ratio: number) => {
              if (x + ox >= 0 && x + ox < width && y + oy >= 0 && y + oy < height) {
                const offset = ((y + oy) * width + (x + ox)) * 4;
                const newCol = data[offset] + quantError * ratio;
                const clamped = Math.min(255, Math.max(0, newCol));
                data[offset] = clamped;
                data[offset + 1] = clamped;
                data[offset + 2] = clamped;
              }
            };

            distributeError(1, 0, 7 / 16);
            distributeError(-1, 1, 3 / 16);
            distributeError(0, 1, 5 / 16);
            distributeError(1, 1, 1 / 16);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      resolve({
        id: Math.random().toString(36).substring(2, 9),
        originalName: file.name,
        dataUrl: canvas.toDataURL('image/png'),
        bmpDataUrl: encodeBMP(imageData, options.bitDepth || 24)
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};
