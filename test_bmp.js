function encodeBMP(imageData, bitDepth = 24) {
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

    view.setUint8(0, 0x42); view.setUint8(1, 0x4D);
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, offset, true);

    view.setUint32(14, 40, true); // DIB header size
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true); // planes
    view.setUint16(28, 8, true); // bpp
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 256, true);
    view.setUint32(50, 256, true);

    // Color table
    for (let i = 0; i < 256; i++) {
      const idx = 54 + i * 4;
      view.setUint8(idx, i);     // B
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
        // Since it's grayscale, R=G=B, just pick one (R)
        pixels[dstOffset + x] = data[srcPx]; 
      }
    }
    
    return buffer;
  }
}
