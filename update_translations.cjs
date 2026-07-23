const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const additions = {
  'EN': 'bitDepth: "Color Depth",\n    bitDepth24: "24-bit RGB",\n    bitDepth8: "8-bit Grayscale",',
  'CS': 'bitDepth: "Barevná hloubka",\n    bitDepth24: "24-bit RGB",\n    bitDepth8: "8-bit Stupně šedi",',
  'DE': 'bitDepth: "Farbtiefe",\n    bitDepth24: "24-bit RGB",\n    bitDepth8: "8-bit Graustufen",',
  'ES': 'bitDepth: "Profundidad de color",\n    bitDepth24: "24-bit RGB",\n    bitDepth8: "8-bit Escala de grises",',
  'FR': 'bitDepth: "Profondeur de couleur",\n    bitDepth24: "24-bit RVB",\n    bitDepth8: "8-bit Niveaux de gris",',
  'ZH': 'bitDepth: "色彩深度",\n    bitDepth24: "24位 RGB",\n    bitDepth8: "8位 灰度",'
};

for (const [lang, add] of Object.entries(additions)) {
  const regex = new RegExp(`(${lang}: \\{[^}]*?)(\\n  \\},|\\n  \\})`, 'g');
  content = content.replace(regex, `$1,\n    ${add}$2`);
}

fs.writeFileSync('src/App.tsx', content);
