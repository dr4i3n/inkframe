const fs = require('fs');

const width = 528;
const height = 792;
const rowSize = Math.ceil(width / 8); // NO PADDING! 66 bytes
const pixelArraySize = rowSize * height;
const fileSize = 54 + 8 + pixelArraySize;

const buffer = new ArrayBuffer(fileSize);
const view = new DataView(buffer);

view.setUint8(0, 0x42); view.setUint8(1, 0x4D);
view.setUint32(2, fileSize, true);
view.setUint16(6, 0, true); view.setUint16(8, 0, true);
view.setUint32(10, 62, true);

view.setUint32(14, 40, true);
view.setInt32(18, width, true);
view.setInt32(22, height, true);
view.setUint16(26, 1, true);
view.setUint16(28, 1, true);
view.setUint32(30, 0, true);
view.setUint32(34, pixelArraySize, true);
view.setInt32(38, 2835, true);
view.setInt32(42, 2835, true);
view.setUint32(46, 2, true);
view.setUint32(50, 2, true);

view.setUint32(54, 0x00000000, true);
view.setUint32(58, 0x00FFFFFF, true);

const pixels = new Uint8Array(buffer, 62);
for (let y = 0; y < height; y++) {
  const dstOffset = y * rowSize;
  for (let x = 0; x < width; x++) {
    const isWhite = ((Math.floor(x / 10) + Math.floor(y / 10)) % 2 === 0);
    if (isWhite) {
      pixels[dstOffset + Math.floor(x / 8)] |= (1 << (7 - (x % 8)));
    }
  }
}

fs.writeFileSync('dist/test_nopad.bmp', Buffer.from(buffer));
console.log("Written to dist/test_nopad.bmp");
