const fs = require('fs');

function encodeBMP24(width, height, data) {
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0x42); view.setUint8(1, 0x4D);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);

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

  const pixels = new Uint8Array(buffer, 54);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    const dstOffset = y * rowSize;
    for (let x = 0; x < width; x++) {
      const srcPx = (srcRow * width + x) * 4;
      const dstPx = dstOffset + x * 3;
      pixels[dstPx] = data[srcPx + 2];     // B
      pixels[dstPx + 1] = data[srcPx + 1]; // G
      pixels[dstPx + 2] = data[srcPx];     // R
    }
  }
  return buffer;
}

const w = 528, h = 792;
const data = new Uint8Array(w * h * 4);
for(let i = 0; i < data.length; i+=4) {
  data[i] = 255; data[i+1] = 0; data[i+2] = 0; data[i+3] = 255; // Red
}

fs.writeFileSync('dist/test_24.bmp', Buffer.from(encodeBMP24(w, h, data)));
console.log("Done");
