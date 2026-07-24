# InkFrame

A free, in-browser tool to convert and optimize images into wallpapers for
**Xteink X3 / X4 / X4 Pro** e-ink readers. Drop in an image, frame it, tune it
for e-ink, and download a BMP sized exactly to the screen.

**Everything runs locally in your browser — no upload, no account, no server.
Your images never leave your machine.**

🔗 **Live:** https://useinkframe.vercel.app

## Features

**Devices**
- X3 (528×792) and X4 / X4 Pro (480×800) — switching the target re-renders instantly.

**Framing (per image)**
- Fill or Contain, with a zoom slider and drag-to-reposition on the live preview.
- Pan with arrow buttons, keyboard shortcuts, mouse wheel, or pinch-to-zoom on touch.
- Rotate 90°. In batch mode every image keeps its own zoom / position / rotation.
- Background for leftover space in Contain: black, white, or a mirrored tile.

**Tone**
- Brightness, contrast and gamma.
- One-click auto-contrast (histogram stretch) for flat, low-contrast scans.
- **⚡ Auto e-ink** preset applies a recommended combination in one tap.
- Invert, and an A/B before/after compare.

**Grayscale (built for e-ink)**
- Grayscale output: **Full 8-bit** is best for photos and art — send the reader a
  clean grayscale image and let its firmware do the high-quality dithering onto the
  panel itself (that's how the built-in wallpapers look smooth). The 16 / 4 / 2
  levels and the dithering modes are there for deliberately stylized
  (posterized / halftone) looks.
- Dithering: Floyd–Steinberg, Atkinson, or Bayer (ordered).
- Export as 8-bit grayscale (recommended, ~⅓ the size) or 24-bit BMP.

**Workflow**
- Batch mode — process many images at once, download the whole batch as a ZIP.
- Light / dark theme, UI in six languages, contextual help on every control.

## Development

```bash
npm install
npm run dev      # Vite dev server at http://localhost:3000
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # type-check (tsc --noEmit)
```

## Docker

Runs as a static site behind nginx — no backend, nothing leaves the container.

```bash
docker build -t inkframe .
docker run --rm -p 8080:80 inkframe
# open http://localhost:8080
```

## Tech

React 19 · TypeScript · Vite · Tailwind CSS. The image pipeline (scaling,
framing, grayscale, dithering and BMP encoding) runs entirely on a canvas in
the browser; `src/lib/zip.ts` is a small dependency-free ZIP writer.

## Deployment

Static Vite app — deploy anywhere (Vercel, Netlify, GitHub Pages…). On Vercel
just import the repo; the framework is auto-detected (build `vite build`,
output `dist`).

## License

[MIT](LICENSE) — free to use, modify and share.
