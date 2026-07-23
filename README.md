# InkFrame — Xteink E‑ink Konvertor

Konvertor a optimalizátor obrázků pro e‑ink čtečky **Xteink X3 a X4**. Nahraješ
fotku, vyladíš ořez a vzhled a stáhneš BMP připravené na displej čtečky. Vše
běží čistě v prohlížeči — žádný upload na server, obrázky neopouštějí zařízení.

## Funkce

- **Cílová zařízení** — X4 (480×800) a X3 (528×792), pixel‑perfect na displej.
- **Formát BMP** — 24‑bit nebo 8‑bit (indexovaná šeď, menší soubor).
- **Vyplnění** — `Fill` (ořez do rámu) nebo `Contain` s pozadím: zrcadlení, černé, bílé.
- **Úprava snímku (pro každý obrázek zvlášť)** — rotace po 90°, zoom, posun (pan) tažením v náhledu.
- **Filtry** — jas, kontrast, invertování, Floyd–Steinberg dithering (počítaný ve floatu pro čistý výsledek).
- **Dávka** — víc obrázků najednou, hromadné stažení jako jeden **ZIP**.
- **Živý náhled** a odhad velikosti výstupního souboru.
- **6 jazyků** (EN, CS, DE, ES, FR, ZH) s automatickou detekcí a uložením volby.

## Vývoj

```bash
npm install
npm run dev      # spustí Vite dev server na http://localhost:3000
npm run build    # produkční build do dist/
npm run preview  # náhled produkčního buildu
npm run lint     # typová kontrola (tsc --noEmit)
```

## Nasazení

Statická Vite aplikace — nasaditelná kamkoli (Vercel, Netlify, GitHub Pages…).
Na Vercelu stačí naimportovat repozitář; framework se detekuje automaticky
(build `vite build`, výstup `dist`).

## Struktura

```
src/
  App.tsx                 UI, stav, překlady
  lib/imageProcessor.ts   canvas pipeline + BMP enkodér
  lib/zip.ts              minimální ZIP writer (bez závislostí)
```

## Licence

Osobní projekt. Podpořit lze přes [Buy me a coffee](https://buymeacoffee.com/destroywrld).
