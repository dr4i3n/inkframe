import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadCloud, Download, Trash2, Crosshair, Plus, Terminal, Sliders, Globe, Coffee, RotateCcw, RotateCw, AlertTriangle, FileArchive, ZoomIn, Sparkles, Copy, Eye, Sun, Moon, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { processImage, GlobalOptions, ProcessedImage, DeviceType, DEVICES, Adjust, DEFAULT_ADJUST, DitherMode } from './lib/imageProcessor';
import { createZip } from './lib/zip';

type Language = 'EN' | 'CS' | 'DE' | 'ES' | 'FR' | 'ZH';
const LANGS: Language[] = ['EN', 'CS', 'DE', 'ES', 'FR', 'ZH'];
type Theme = 'dark' | 'light';

const TRANSLATIONS: Record<Language, any> = {
  EN: {
    title: "InkFrame", settings: "Settings", targetDevice: "Target Device", fillMode: "Scaling",
    fill: "Fill", contain: "Contain", background: "Background", bgBlack: "Black", bgWhite: "White", bgMirror: "Mirror",
    tone: "Tone", brightness: "Brightness", contrast: "Contrast", gamma: "Gamma", autoContrast: "Auto contrast",
    output: "Output", levels: "Grays", full: "Full", dither: "Dither", off: "Off", invert: "Invert",
    preset: "Auto e-ink", applyAll: "Apply framing to all", compare: "Compare A/B", original: "Original",
    reset: "Reset framing", library: "Images", failed: "Failed", addMore: "Add images",
    dropHint: "Drop images here or click to browse", processing: "Processing…",
    downloadAll: "ZIP", downloadBmp: "Download BMP", awaitingSignal: "Drop an image to begin",
    incomingStream: "Drop to import", releaseToProcess: "Release to process", bitDepth: "Format",
    hintTone: "Rescues a flat or dark image before export. Auto contrast automatically pins the darkest tone to black and the lightest to white; Gamma brightens or darkens the midtones; Brightness and Contrast are manual fine-tuning.",
    hintOutput: "Builds the final black-and-white image: how many shades of gray it keeps, and the dot pattern used to simulate the shades in between.",
    hintLevels: "How many shades of gray the export keeps. For photos & art use FULL — send the reader a clean grayscale image and let it dither onto its panel itself (that's how the built-in wallpapers look smooth). 16 / 4 / 2 are only for a deliberate posterized look.",
    hintDither: "Usually leave this OFF — the reader dithers full-grayscale images itself, and better. Turn it on only for a deliberate halftone / retro look. F-S = detailed, Atkinson = punchy, Bayer = even grid.",
    hintInvert: "Swaps light and dark — for a dark-themed wallpaper, or to fix a scan that came out as a negative.",
    pan: "Move",
  },
  CS: {
    title: "InkFrame", settings: "Nastavení", targetDevice: "Cílové zařízení", fillMode: "Vyplnění",
    fill: "Vyplnit", contain: "Přizpůsobit", background: "Pozadí", bgBlack: "Černé", bgWhite: "Bílé", bgMirror: "Zrcadlení",
    tone: "Tón", brightness: "Jas", contrast: "Kontrast", gamma: "Gama", autoContrast: "Auto kontrast",
    output: "Výstup", levels: "Odstíny", full: "Plné", dither: "Dither", off: "Vyp", invert: "Invert",
    preset: "Auto e-ink", applyAll: "Úpravu na všechny", compare: "Porovnat A/B", original: "Originál",
    reset: "Reset úprav", library: "Obrázky", failed: "Chyba", addMore: "Přidat obrázky",
    dropHint: "Přetáhni obrázky sem nebo klikni", processing: "Zpracovávám…",
    downloadAll: "ZIP", downloadBmp: "Stáhnout BMP", awaitingSignal: "Začni přetažením obrázku",
    incomingStream: "Pusť pro import", releaseToProcess: "Pusť pro zpracování", bitDepth: "Formát",
    hintTone: "Vytáhne plochý nebo tmavý obrázek před exportem. Auto kontrast automaticky posadí nejtmavší tón na černou a nejsvětlejší na bílou; Gama zesvětlí nebo ztmaví střední tóny; Jas a Kontrast jsou ruční doladění.",
    hintOutput: "Sestaví finální černobílý obrázek: kolik odstínů šedi si nechá a jakým vzorem bodů se dopočítají mezistupně.",
    hintLevels: "Kolik odstínů šedi si výstup nechá. Na fotky a grafiku dej FULL — pošli čtečce čistý grayscale a nech ji, ať si ho sama rozditheruje na svůj panel (tak vypadají hladce i vestavěné tapety). 16 / 4 / 2 jsou jen na záměrně plakátový vzhled.",
    hintDither: "Většinou nech VYP — čtečka si plný grayscale rozditheruje sama a líp. Zapni jen na záměrný halftone / retro efekt. F-S = detailní, Atkinson = úderný, Bayer = pravidelný rastr.",
    hintInvert: "Prohodí světlou a tmavou — pro tapetu v tmavém motivu, nebo když sken vyšel jako negativ.",
    pan: "Posun",
  },
  DE: {
    title: "InkFrame", settings: "Einstellungen", targetDevice: "Zielgerät", fillMode: "Skalierung",
    fill: "Füllen", contain: "Anpassen", background: "Hintergrund", bgBlack: "Schwarz", bgWhite: "Weiß", bgMirror: "Spiegeln",
    tone: "Tonwert", brightness: "Helligkeit", contrast: "Kontrast", gamma: "Gamma", autoContrast: "Auto-Kontrast",
    output: "Ausgabe", levels: "Graustufen", full: "Voll", dither: "Dither", off: "Aus", invert: "Invert",
    preset: "Auto E-Ink", applyAll: "Auf alle anwenden", compare: "Vergleich A/B", original: "Original",
    reset: "Zurücksetzen", library: "Bilder", failed: "Fehler", addMore: "Bilder hinzufügen",
    dropHint: "Bilder hierher ziehen oder klicken", processing: "Verarbeitung…",
    downloadAll: "ZIP", downloadBmp: "BMP laden", awaitingSignal: "Bild ablegen zum Start",
    incomingStream: "Zum Importieren ablegen", releaseToProcess: "Loslassen zum Verarbeiten", bitDepth: "Format",
    hintTone: "Hebt ein flaches oder dunkles Bild vor dem Export an. Auto-Kontrast setzt automatisch den dunkelsten Ton auf Schwarz und den hellsten auf Weiß; Gamma hellt die Mitteltöne auf oder ab; Helligkeit und Kontrast sind manuelle Feinabstimmung.",
    hintOutput: "Erzeugt das finale Schwarz-Weiß-Bild: wie viele Graustufen es behält und mit welchem Punktmuster die Zwischentöne simuliert werden.",
    hintLevels: "Wie viele Graustufen der Export behält. Für Fotos & Grafik VOLL nutzen — gib dem Reader ein sauberes Graustufenbild und lass ihn selbst auf sein Panel dithern (so wirken auch die mitgelieferten Wallpaper glatt). 16 / 4 / 2 nur für einen bewusst plakativen Look.",
    hintDither: "Normalerweise AUS lassen — der Reader dithert Vollgraustufenbilder selbst, und besser. Nur für einen bewussten Halbton-/Retro-Look einschalten. F-S = detailliert, Atkinson = kräftig, Bayer = gleichmäßiges Raster.",
    hintInvert: "Vertauscht Hell und Dunkel — für ein dunkles Wallpaper oder um einen negativen Scan zu korrigieren.",
    pan: "Verschieben",
  },
  ES: {
    title: "InkFrame", settings: "Ajustes", targetDevice: "Dispositivo", fillMode: "Escala",
    fill: "Llenar", contain: "Contener", background: "Fondo", bgBlack: "Negro", bgWhite: "Blanco", bgMirror: "Espejo",
    tone: "Tono", brightness: "Brillo", contrast: "Contraste", gamma: "Gama", autoContrast: "Auto contraste",
    output: "Salida", levels: "Grises", full: "Completo", dither: "Dither", off: "No", invert: "Invert",
    preset: "Auto e-ink", applyAll: "Aplicar a todas", compare: "Comparar A/B", original: "Original",
    reset: "Restablecer", library: "Imágenes", failed: "Error", addMore: "Añadir imágenes",
    dropHint: "Arrastra imágenes o haz clic", processing: "Procesando…",
    downloadAll: "ZIP", downloadBmp: "Descargar BMP", awaitingSignal: "Suelta una imagen para empezar",
    incomingStream: "Suelta para importar", releaseToProcess: "Suelta para procesar", bitDepth: "Formato",
    hintTone: "Recupera una imagen plana u oscura antes de exportar. Auto contraste lleva el tono más oscuro a negro y el más claro a blanco automáticamente; Gama aclara u oscurece los medios tonos; Brillo y Contraste son ajuste manual.",
    hintOutput: "Crea la imagen final en blanco y negro: cuántos tonos de gris conserva y el patrón de puntos que simula los tonos intermedios.",
    hintLevels: "Cuántos tonos de gris conserva la exportación. Para fotos y arte usa COMPLETO — envía al lector una imagen en escala de grises limpia y deja que él la tramé en su panel (así se ven suaves los fondos incluidos). 16 / 4 / 2 solo para un look posterizado a propósito.",
    hintDither: "Normalmente déjalo en NO — el lector tramifica las imágenes en escala de grises él mismo, y mejor. Actívalo solo para un efecto de semitono / retro deliberado. F-S = detallado, Atkinson = con fuerza, Bayer = rejilla uniforme.",
    hintInvert: "Intercambia claro y oscuro — para un fondo oscuro o para corregir un escaneo en negativo.",
    pan: "Mover",
  },
  FR: {
    title: "InkFrame", settings: "Paramètres", targetDevice: "Appareil", fillMode: "Échelle",
    fill: "Remplir", contain: "Contenir", background: "Arrière-plan", bgBlack: "Noir", bgWhite: "Blanc", bgMirror: "Miroir",
    tone: "Tonalité", brightness: "Luminosité", contrast: "Contraste", gamma: "Gamma", autoContrast: "Auto contraste",
    output: "Sortie", levels: "Gris", full: "Complet", dither: "Dither", off: "Non", invert: "Invert",
    preset: "Auto e-ink", applyAll: "Appliquer à toutes", compare: "Comparer A/B", original: "Original",
    reset: "Réinitialiser", library: "Images", failed: "Échec", addMore: "Ajouter des images",
    dropHint: "Glissez des images ou cliquez", processing: "Traitement…",
    downloadAll: "ZIP", downloadBmp: "Télécharger BMP", awaitingSignal: "Déposez une image pour commencer",
    incomingStream: "Déposez pour importer", releaseToProcess: "Relâchez pour traiter", bitDepth: "Format",
    hintTone: "Récupère une image plate ou sombre avant l'export. Auto contraste place le ton le plus foncé sur le noir et le plus clair sur le blanc automatiquement ; Gamma éclaircit ou assombrit les tons moyens ; Luminosité et Contraste sont un réglage manuel.",
    hintOutput: "Construit l'image finale en noir et blanc : combien de niveaux de gris elle conserve et le motif de points qui simule les tons intermédiaires.",
    hintLevels: "Combien de niveaux de gris l'export conserve. Pour les photos et illustrations, utilisez COMPLET — envoyez au lecteur une image en niveaux de gris propre et laissez-le tramer lui-même sur son écran (c'est ainsi que les fonds intégrés sont lisses). 16 / 4 / 2 seulement pour un rendu postérisé volontaire.",
    hintDither: "Laissez-le en général sur NON — le lecteur trame lui-même les images en niveaux de gris, et mieux. Activez-le seulement pour un effet demi-teinte / rétro voulu. F-S = détaillé, Atkinson = punchy, Bayer = grille régulière.",
    hintInvert: "Inverse clair et foncé — pour un fond sombre ou corriger un scan en négatif.",
    pan: "Déplacer",
  },
  ZH: {
    title: "InkFrame", settings: "设置", targetDevice: "目标设备", fillMode: "缩放",
    fill: "填充", contain: "适应", background: "背景", bgBlack: "黑", bgWhite: "白", bgMirror: "镜像",
    tone: "色调", brightness: "亮度", contrast: "对比度", gamma: "伽马", autoContrast: "自动对比",
    output: "输出", levels: "灰阶", full: "完整", dither: "抖动", off: "关", invert: "反色",
    preset: "自动电子墨水", applyAll: "应用到全部", compare: "对比 A/B", original: "原图",
    reset: "重置", library: "图片", failed: "失败", addMore: "添加图片",
    dropHint: "拖入图片或点击选择", processing: "处理中…",
    downloadAll: "ZIP", downloadBmp: "下载 BMP", awaitingSignal: "拖入图片开始",
    incomingStream: "松开以导入", releaseToProcess: "松开以处理", bitDepth: "格式",
    hintTone: "导出前提亮平淡或偏暗的图片。自动对比会自动把最暗的色调压到纯黑、最亮的提到纯白；伽马提亮或压暗中间调；亮度和对比度用于手动微调。",
    hintOutput: "生成最终的黑白图像：保留多少灰阶，以及用什么点阵图案模拟中间色调。",
    hintLevels: "导出保留多少灰阶。照片和插画用「完整」——把干净的灰度图交给阅读器，让它自己抖动到面板上（内置壁纸就是这样保持平滑的）。16 / 4 / 2 只用于刻意的海报化风格。",
    hintDither: "通常保持「关」——阅读器会自己抖动全灰度图，而且更好。只在需要刻意的半调/复古效果时才开。F-S=细腻，Atkinson=有力，Bayer=均匀网格。",
    hintInvert: "黑白互换——用于深色壁纸，或修正扫描出的负片。",
    pan: "移动",
  }
};

interface SourceFile { id: string; file: File; adjust: Adjust; }
interface Result extends Partial<ProcessedImage> { id: string; originalName: string; error?: boolean; }

const DEFAULT_OPTIONS: GlobalOptions = {
  device: 'X3', fitMode: 'cover', invert: false,
  brightness: 0, contrast: 0, gamma: 1, autoLevels: false,
  grayLevels: 256, ditherMode: 'none', backgroundFill: 'mirror', bitDepth: 8,
};

const getInitialLang = (): Language => {
  try { const s = localStorage.getItem('if-lang') as Language | null; if (s && LANGS.includes(s)) return s; } catch { /* */ }
  return 'EN';
};
const getInitialTheme = (): Theme => {
  try { const s = localStorage.getItem('if-theme'); if (s === 'light' || s === 'dark') return s; } catch { /* */ }
  return 'dark';
};
const getInitialOptions = (): GlobalOptions => {
  try { const s = localStorage.getItem('if-options'); if (s) return { ...DEFAULT_OPTIONS, ...JSON.parse(s) }; } catch { /* */ }
  return DEFAULT_OPTIONS;
};

const formatBytes = (b: number): string =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(2)} MB`;

const HintIcon = ({ text }: { text: string }) => (
  <span className="group/hint inline-flex align-middle" tabIndex={0} aria-label={text}>
    <HelpCircle className="w-3.5 h-3.5 text-[var(--text-faint)] hover:text-[var(--text-dim)] cursor-help transition-colors" strokeWidth={1.75} />
    {/* Spans the full field width (anchored to the relative Field) so it never clips against the panel overflow. */}
    <span className="pointer-events-none absolute left-0 right-0 top-7 z-40 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5 text-[10px] leading-relaxed font-sans normal-case tracking-normal text-[var(--text-dim)] opacity-0 shadow-xl transition-opacity duration-150 group-hover/hint:opacity-100 group-focus/hint:opacity-100">
      {text}
    </span>
  </span>
);

const Field = ({ label, hint, right, children }: { label: string; hint?: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-2 relative">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-mute)]">{label}</span>
        {hint && <HintIcon text={hint} />}
      </div>
      {right}
    </div>
    {children}
  </div>
);

function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 p-1 border rounded-lg bg-[var(--panel2)] border-[var(--border)]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={value === o.value} title={o.title}
          className={`px-1.5 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            value === o.value ? 'bg-[var(--active-bg)] text-[var(--active-text)] font-semibold shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--input)]'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const ToneSlider = ({ label, value, min, max, display, onChange }: { label: string; value: number; min: number; max: number; display: string; onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-[11px] font-mono text-[var(--text-dim)] mb-1"><span>{label}</span><span className="text-[var(--text)] font-bold tabular-nums">{display}</span></div>
    <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--track)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--active-bg)] hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform" />
  </div>
);

const ToolBtn = ({ onClick, label, active, children }: { onClick: () => void; label: string; active?: boolean; children: React.ReactNode }) => (
  <button onClick={onClick} title={label} aria-label={label}
    className={`grid place-items-center w-8 h-8 rounded-lg border transition-colors ${active ? 'bg-[var(--active-bg)] text-[var(--active-text)] border-[var(--active-bg)]' : 'border-[var(--border)] bg-[var(--panel2)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-faint)]'}`}>
    {children}
  </button>
);

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const t = TRANSLATIONS[lang];

  useEffect(() => { try { localStorage.setItem('if-lang', lang); } catch { /* */ } document.documentElement.lang = lang.toLowerCase(); }, [lang]);
  useEffect(() => { try { localStorage.setItem('if-theme', theme); } catch { /* */ } }, [theme]);

  const [options, setOptions] = useState<GlobalOptions>(getInitialOptions);
  useEffect(() => { try { localStorage.setItem('if-options', JSON.stringify(options)); } catch { /* */ } }, [options]);

  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [dragThumb, setDragThumb] = useState<number | null>(null);

  const dragStart = useRef({ x: 0, y: 0 });
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const tapInfo = useRef<{ t: number; x: number; y: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (sourceFiles.length === 0) { if (mounted) setResults([]); return; }
      setIsProcessing(true);
      const out: Result[] = [];
      for (const src of sourceFiles) {
        try { out.push({ ...(await processImage(src.file, options, src.adjust)), id: src.id }); }
        catch (err) { console.error(err); out.push({ id: src.id, originalName: src.file.name, error: true }); }
      }
      if (mounted) { setResults(out); setIsProcessing(false); }
    };
    const timer = setTimeout(run, 150);
    return () => { mounted = false; clearTimeout(timer); };
  }, [sourceFiles, options]);

  const selectedSource = sourceFiles[selectedIndex] ?? null;
  const adjust = selectedSource?.adjust ?? DEFAULT_ADJUST;
  const selectedResult = selectedSource ? results.find(r => r.id === selectedSource.id) ?? null : null;
  const validCount = results.filter(r => r.bmpBlob).length;
  const dev = DEVICES[options.device];

  const updateAdjust = useCallback((patch: Partial<Adjust>) => {
    setSourceFiles(prev => prev.map((s, i) => i === selectedIndex ? { ...s, adjust: { ...s.adjust, ...patch } } : s));
  }, [selectedIndex]);

  const applyToAll = () => {
    const a = sourceFiles[selectedIndex]?.adjust;
    if (!a) return;
    setSourceFiles(prev => prev.map(s => ({ ...s, adjust: { ...a } })));
  };

  const handleAddFiles = (files: FileList | File[]) => {
    const add: SourceFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('image/')) add.push({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`, file: f, adjust: { ...DEFAULT_ADJUST } });
    }
    if (!add.length) return;
    setSourceFiles(prev => { if (prev.length === 0) setSelectedIndex(0); return [...prev, ...add]; });
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }, []);
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleAddFiles(e.dataTransfer.files); }, []);
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) handleAddFiles(e.target.files); e.target.value = ''; };

  const removeFile = (id: string, index: number) => {
    setSourceFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIndex(prev => index < prev ? prev - 1 : index === prev ? Math.max(0, prev - 1) : prev);
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setSourceFiles(prev => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
    setSelectedIndex(to);
  };

  const downloadSingle = (r: Result) => {
    if (!r.bmpBlob) return;
    const url = URL.createObjectURL(r.bmpBlob);
    const a = document.createElement('a');
    a.href = url; a.download = `${r.originalName.replace(/\.[^/.]+$/, "")}_${options.device}.bmp`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const downloadAll = async () => {
    const valid = results.filter(r => r.bmpBlob);
    if (!valid.length) return;
    const entries = await Promise.all(valid.map(async r => ({ name: `${r.originalName.replace(/\.[^/.]+$/, "")}_${options.device}.bmp`, data: new Uint8Array(await r.bmpBlob!.arrayBuffer()) })));
    const url = URL.createObjectURL(createZip(entries));
    const a = document.createElement('a');
    a.href = url; a.download = `inkframe_${options.device}_${valid.length}.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Pointer: drag to pan, two-finger pinch to zoom, double-tap to reset.
  const dist2 = () => {
    const pts = [...pointers.current.values()];
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (!selectedSource) return;
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* */ }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { pinch.current = { dist: dist2(), scale: adjust.scale }; setIsPreviewDragging(false); }
    else { setIsPreviewDragging(true); dragStart.current = { x: e.clientX, y: e.clientY }; tapInfo.current = { t: Date.now(), x: e.clientX, y: e.clientY, moved: false }; }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2 && pinch.current) {
      const scale = Math.min(200, Math.max(50, Math.round(pinch.current.scale * (dist2() / pinch.current.dist))));
      updateAdjust({ scale });
      return;
    }
    if (isPreviewDragging) {
      updateAdjust({ panX: adjust.panX + (e.clientX - dragStart.current.x), panY: adjust.panY + (e.clientY - dragStart.current.y) });
      dragStart.current = { x: e.clientX, y: e.clientY };
      if (tapInfo.current) tapInfo.current.moved = true;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* */ }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setIsPreviewDragging(false);
    // Double-tap → reset framing.
    const ti = tapInfo.current;
    if (ti && !ti.moved && Date.now() - ti.t < 250) {
      const now = Date.now();
      if (now - lastTap.current < 320) { updateAdjust({ ...DEFAULT_ADJUST }); lastTap.current = 0; }
      else lastTap.current = now;
    }
    tapInfo.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!selectedSource) return;
    updateAdjust({ scale: Math.min(200, Math.max(50, adjust.scale + (e.deltaY < 0 ? 4 : -4))) });
  };

  // Keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedSource) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const step = e.shiftKey ? 40 : 10;
      switch (e.key) {
        case 'ArrowLeft': updateAdjust({ panX: adjust.panX - step }); break;
        case 'ArrowRight': updateAdjust({ panX: adjust.panX + step }); break;
        case 'ArrowUp': updateAdjust({ panY: adjust.panY - step }); break;
        case 'ArrowDown': updateAdjust({ panY: adjust.panY + step }); break;
        case '+': case '=': updateAdjust({ scale: Math.min(200, adjust.scale + 5) }); break;
        case '-': case '_': updateAdjust({ scale: Math.max(50, adjust.scale - 5) }); break;
        case 'r': updateAdjust({ rotate: (adjust.rotate + 90) % 360 }); break;
        case 'R': updateAdjust({ rotate: (adjust.rotate + 270) % 360 }); break;
        case '0': updateAdjust({ ...DEFAULT_ADJUST }); break;
        case '[': setSelectedIndex(i => Math.max(0, i - 1)); break;
        case ']': setSelectedIndex(i => Math.min(sourceFiles.length - 1, i + 1)); break;
        case 'Delete': case 'Backspace': removeFile(selectedSource.id, selectedIndex); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedSource, adjust, selectedIndex, sourceFiles.length, updateAdjust]);

  const previewSrc = showOriginal ? selectedResult?.originalUrl : selectedResult?.dataUrl;

  return (
    <div className={`${theme === 'light' ? 'theme-light' : ''} relative min-h-screen bg-[var(--bg)] text-[var(--text-dim)] font-sans p-3 sm:p-4 lg:p-6`}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className="pointer-events-none fixed inset-0 opacity-60" style={{ background: 'radial-gradient(1000px 600px at 70% -10%, rgba(59,130,246,0.06), transparent 60%)' }} />

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[var(--bg)]/92 backdrop-blur-sm border-2 border-dashed border-[var(--text-faint)] m-3 rounded-3xl flex flex-col items-center justify-center">
          <UploadCloud className="w-14 h-14 text-[var(--text)] mb-5 animate-bounce" strokeWidth={1} />
          <div className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--text)]">{t.incomingStream}</div>
          <div className="font-mono text-[10px] text-[var(--text-mute)] mt-2 uppercase tracking-widest">{t.releaseToProcess}</div>
        </div>
      )}

      <div className="relative max-w-[1500px] mx-auto flex flex-col gap-4 lg:h-[calc(100vh-3rem)]">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 bg-[var(--panel)] border border-[var(--border)] rounded-2xl px-4 sm:px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 text-[var(--text)]">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--active-bg)] text-[var(--active-text)]"><Crosshair className="w-4 h-4" strokeWidth={2} /></div>
            <div className="leading-tight">
              <h1 className="text-sm sm:text-base font-semibold tracking-[0.15em] uppercase">{t.title}</h1>
              <div className="font-mono text-[9px] text-[var(--text-mute)] tracking-[0.2em] uppercase">E-ink · Xteink X3 / X4 / X4 Pro</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme"
              className="grid place-items-center w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--panel2)] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-0.5 border border-[var(--border)] bg-[var(--panel2)] p-0.5 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-[var(--text-mute)] mx-1" strokeWidth={1.5} />
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)} aria-label={`Language ${l}`}
                  className={`px-1.5 py-1 text-[10px] font-mono tracking-wider rounded-md transition-colors ${lang === l ? 'bg-[var(--active-bg)] text-[var(--active-text)] font-bold' : 'text-[var(--text-mute)] hover:text-[var(--text-dim)]'}`}>{l}</button>
              ))}
            </div>
            <a href="https://buymeacoffee.com/destroywrld" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-amber-600/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors px-2.5 py-1.5 rounded-lg text-[10px] tracking-widest uppercase font-bold">
              <Coffee className="w-3.5 h-3.5" /><span className="hidden sm:inline">Coffee</span>
            </a>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-3.5 bg-[var(--panel)] border border-[var(--border)] rounded-2xl px-5 py-4 lg:overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2.5 text-[var(--text)]">
              <Sliders className="w-4 h-4 text-[var(--text-mute)]" strokeWidth={1.5} />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold">{t.settings}</h2>
            </div>

            <button onClick={() => setOptions(o => ({ ...o, autoLevels: true, grayLevels: 256, ditherMode: 'none', gamma: 1, brightness: 0, contrast: 0 }))}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-[var(--border)] bg-[var(--panel2)] text-[var(--text)] text-[11px] font-mono uppercase tracking-widest hover:border-[var(--text-faint)] transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />{t.preset}
            </button>

            <Field label={t.targetDevice}>
              <Segmented value={options.device} onChange={(device) => setOptions({ ...options, device })}
                options={(['X3', 'X4'] as DeviceType[]).map(d => ({ value: d, label: <span className="flex flex-col leading-tight"><span>{d}</span><span className="text-[8px] opacity-60">{DEVICES[d].width}×{DEVICES[d].height}</span></span> }))} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t.fillMode}>
                <Segmented value={options.fitMode} onChange={(fitMode) => setOptions({ ...options, fitMode })}
                  options={[{ value: 'cover', label: t.fill }, { value: 'contain', label: t.contain }]} />
              </Field>
              <Field label={t.bitDepth}>
                <Segmented value={String(options.bitDepth)} onChange={(v) => setOptions({ ...options, bitDepth: parseInt(v) as 8 | 24 })}
                  options={[{ value: '8', label: <span className="flex items-center gap-1">8-bit<span className="w-1.5 h-1.5 rounded-full bg-amber-500" /></span> }, { value: '24', label: '24-bit' }]} />
              </Field>
            </div>

            {options.fitMode === 'contain' && (
              <Field label={t.background}>
                <Segmented value={options.backgroundFill} onChange={(v) => setOptions({ ...options, backgroundFill: v as GlobalOptions['backgroundFill'] })}
                  options={[{ value: 'mirror', label: t.bgMirror }, { value: 'black', label: t.bgBlack }, { value: 'white', label: t.bgWhite }]} />
              </Field>
            )}

            <Field label={t.tone} hint={t.hintTone} right={
              <button onClick={() => setOptions({ ...options, autoLevels: !options.autoLevels })} aria-pressed={options.autoLevels}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border transition-colors ${options.autoLevels ? 'bg-[var(--active-bg)] text-[var(--active-text)] border-[var(--active-bg)]' : 'border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text-dim)]'}`}>{t.autoContrast}</button>
            }>
              <div className="space-y-2.5 p-3 border border-[var(--border)] bg-[var(--panel2)] rounded-xl">
                <ToneSlider label={t.brightness} value={options.brightness} min={-100} max={100} display={`${options.brightness > 0 ? '+' : ''}${options.brightness}`} onChange={(v) => setOptions({ ...options, brightness: v })} />
                <ToneSlider label={t.contrast} value={options.contrast} min={-100} max={100} display={`${options.contrast > 0 ? '+' : ''}${options.contrast}`} onChange={(v) => setOptions({ ...options, contrast: v })} />
                <ToneSlider label={t.gamma} value={Math.round(options.gamma * 100)} min={40} max={260} display={options.gamma.toFixed(2)} onChange={(v) => setOptions({ ...options, gamma: v / 100 })} />
              </div>
            </Field>

            <Field label={t.output} hint={t.hintOutput}>
              <div className="space-y-2.5">
                <Segmented value={String(options.grayLevels)} onChange={(v) => setOptions({ ...options, grayLevels: parseInt(v) })}
                  options={[256, 16, 4, 2].map(n => ({
                    value: String(n),
                    label: n === 256
                      ? <span className="flex items-center gap-1">{t.full}<span className="w-1.5 h-1.5 rounded-full bg-amber-500" /></span>
                      : String(n),
                    title: n === 256 ? `★ ${t.hintLevels}` : t.hintLevels,
                  }))} />
                <Segmented value={options.ditherMode} onChange={(v) => setOptions({ ...options, ditherMode: v as DitherMode })}
                  options={[{ value: 'none', label: <span className="flex items-center gap-1">{t.off}<span className="w-1.5 h-1.5 rounded-full bg-amber-500" /></span>, title: `★ ${t.hintDither}` }, { value: 'floyd', label: 'F-S', title: t.hintDither }, { value: 'atkinson', label: 'Atk', title: t.hintDither }, { value: 'bayer', label: 'Bayer', title: t.hintDither }]} />
                <button title={t.hintInvert} onClick={() => setOptions({ ...options, invert: !options.invert })} aria-pressed={options.invert}
                  className={`flex items-center justify-center gap-2 w-full p-2.5 border rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${options.invert ? 'bg-[var(--active-bg)] border-[var(--active-bg)] text-[var(--active-text)] font-semibold' : 'bg-[var(--panel2)] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]'}`}>
                  <span className={`w-2 h-2 rounded-full ${options.invert ? 'bg-[var(--active-text)]' : 'bg-[var(--text-faint)]'}`} />{t.invert}
                </button>
              </div>
            </Field>
          </aside>

          {/* Preview column */}
          <section className="flex-1 flex flex-col gap-4 min-h-0">

            <div className="flex-1 flex flex-col bg-[var(--panel)] border border-[var(--border)] rounded-2xl overflow-hidden min-h-[320px]">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)] shrink-0">
                <div className={`flex items-center gap-1.5 ${selectedSource && !selectedResult?.error ? '' : 'opacity-40 pointer-events-none'}`}>
                  <ToolBtn onClick={() => updateAdjust({ rotate: (adjust.rotate + 270) % 360 })} label="Rotate ⟲"><RotateCcw className="w-4 h-4" /></ToolBtn>
                  <ToolBtn onClick={() => updateAdjust({ rotate: (adjust.rotate + 90) % 360 })} label="Rotate ⟳"><RotateCw className="w-4 h-4" /></ToolBtn>
                  <div className="w-px h-5 bg-[var(--border)] mx-1" />
                  <ZoomIn className="w-3.5 h-3.5 text-[var(--text-mute)]" />
                  <input type="range" min={50} max={200} step={1} value={adjust.scale} onChange={(e) => updateAdjust({ scale: parseInt(e.target.value) })}
                    className="w-20 sm:w-28 h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--track)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--active-bg)]" />
                  <span className="font-mono text-[11px] text-[var(--text-dim)] w-9 tabular-nums">{adjust.scale}%</span>
                  <div className="w-px h-5 bg-[var(--border)] mx-1" />
                  <ToolBtn onClick={() => updateAdjust({ panX: adjust.panX - 20 })} label={`${t.pan} ←`}><ArrowLeft className="w-3.5 h-3.5" /></ToolBtn>
                  <ToolBtn onClick={() => updateAdjust({ panY: adjust.panY - 20 })} label={`${t.pan} ↑`}><ArrowUp className="w-3.5 h-3.5" /></ToolBtn>
                  <ToolBtn onClick={() => updateAdjust({ panY: adjust.panY + 20 })} label={`${t.pan} ↓`}><ArrowDown className="w-3.5 h-3.5" /></ToolBtn>
                  <ToolBtn onClick={() => updateAdjust({ panX: adjust.panX + 20 })} label={`${t.pan} →`}><ArrowRight className="w-3.5 h-3.5" /></ToolBtn>
                  <div className="w-px h-5 bg-[var(--border)] mx-1" />
                  <ToolBtn onClick={() => updateAdjust({ ...DEFAULT_ADJUST })} label={t.reset}><RotateCcw className="w-3.5 h-3.5" /></ToolBtn>
                  {sourceFiles.length > 1 && <ToolBtn onClick={applyToAll} label={t.applyAll}><Copy className="w-3.5 h-3.5" /></ToolBtn>}
                  {selectedResult?.originalUrl && (
                    <ToolBtn onClick={() => setShowOriginal(v => !v)} active={showOriginal} label={t.compare}><Eye className="w-3.5 h-3.5" /></ToolBtn>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isProcessing && <span className="text-[10px] font-mono text-emerald-500 animate-pulse tracking-widest uppercase">{t.processing}</span>}
                  {validCount > 1 && (
                    <button onClick={downloadAll} disabled={isProcessing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[11px] font-mono uppercase tracking-widest text-[var(--text-dim)] hover:bg-[var(--input)] hover:text-[var(--text)] transition-colors disabled:opacity-50">
                      <FileArchive className="w-3.5 h-3.5" />{t.downloadAll}
                    </button>
                  )}
                  {selectedResult?.bmpBlob && (
                    <button onClick={() => downloadSingle(selectedResult)} disabled={isProcessing} className="flex items-center gap-2 px-4 py-1.5 bg-[var(--active-bg)] text-[var(--active-text)] text-[11px] font-mono font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 rounded-lg">
                      <Download className="w-3.5 h-3.5" strokeWidth={2.5} /><span className="hidden sm:inline">{t.downloadBmp}</span><span className="sm:hidden">BMP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview surface */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6 sm:p-10">
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--grid) 1px, transparent 1px)', backgroundSize: '26px 26px', opacity: 0.3 }} />

                {selectedResult?.error ? (
                  <div className="relative flex flex-col items-center text-red-500 z-10"><AlertTriangle className="w-10 h-10 mb-4" strokeWidth={1} /><span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t.failed}</span></div>
                ) : previewSrc ? (
                  <>
                    <div className={`relative bg-white shadow-[0_10px_60px_rgba(0,0,0,0.5)] ring-1 ring-black/10 rounded-[2px] z-10 overflow-hidden touch-none ${isPreviewDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ aspectRatio: `${dev.width} / ${dev.height}`, maxHeight: '100%', maxWidth: '100%' }}
                      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}>
                      <img src={previewSrc} className="block w-full h-full object-cover pointer-events-none select-none" alt={selectedResult?.originalName} draggable={false} />
                      {showOriginal && <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded">{t.original}</div>}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-[10px] font-mono text-[var(--text-mute)] uppercase tracking-widest pointer-events-none">
                      <span className="truncate max-w-[40%] text-[var(--text-dim)] normal-case tracking-normal">{selectedResult?.originalName}</span>
                      <span className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <span>{dev.width}×{dev.height}</span><span>{options.bitDepth}-bit</span>
                        {selectedResult?.byteSize && <span className="text-[var(--text-dim)]">{formatBytes(selectedResult.byteSize)}</span>}
                      </span>
                    </div>
                  </>
                ) : (
                  <label className="relative z-10 flex flex-col items-center justify-center text-[var(--text-faint)] cursor-pointer group">
                    <div className="grid place-items-center w-16 h-16 rounded-2xl border border-dashed border-[var(--border)] group-hover:border-[var(--text-faint)] transition-colors mb-5"><Terminal className="w-7 h-7 opacity-50" strokeWidth={1} /></div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] group-hover:text-[var(--text-mute)] transition-colors">{t.awaitingSignal}</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                  </label>
                )}
              </div>
            </div>

            {/* Filmstrip */}
            <div className="shrink-0 bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-3">
              {sourceFiles.length === 0 ? (
                <label className="flex items-center justify-center gap-3 h-[76px] border border-dashed border-[var(--border)] rounded-xl text-[11px] font-mono uppercase tracking-widest text-[var(--text-mute)] hover:text-[var(--text-dim)] hover:border-[var(--text-faint)] cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4" />{t.dropHint}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                </label>
              ) : (
                <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                  <div className="flex items-center gap-1 pr-1 shrink-0">
                    <span className="font-mono text-[9px] text-[var(--text-mute)] uppercase tracking-widest">{t.library}</span>
                    <span className="font-mono text-[9px] bg-[var(--panel2)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-dim)]">{results.length}</span>
                  </div>
                  {sourceFiles.map((src, idx) => {
                    const result = results.find(r => r.id === src.id);
                    const selected = selectedIndex === idx;
                    return (
                      <button key={src.id} onClick={() => setSelectedIndex(idx)}
                        draggable onDragStart={() => setDragThumb(idx)} onDragOver={(e) => e.preventDefault()}
                        onDrop={() => { if (dragThumb !== null) reorder(dragThumb, idx); setDragThumb(null); }} onDragEnd={() => setDragThumb(null)}
                        className={`group relative shrink-0 w-14 h-[76px] rounded-lg overflow-hidden border transition-all ${selected ? 'border-[var(--text)] ring-2 ring-[var(--text)]/20' : 'border-[var(--border)] hover:border-[var(--text-faint)]'} ${dragThumb === idx ? 'opacity-40' : ''}`}
                        title={src.file.name}>
                        <div className="absolute inset-0 bg-[var(--input)] grid place-items-center">
                          {result?.error ? <AlertTriangle className="w-4 h-4 text-red-500" />
                            : result?.dataUrl ? <img src={result.dataUrl} alt={src.file.name} className={`w-full h-full object-cover ${selected ? '' : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
                            : <div className="w-3.5 h-3.5 border-2 border-[var(--border)] border-t-[var(--text-dim)] rounded-full animate-spin" />}
                        </div>
                        <span onClick={(e) => { e.stopPropagation(); removeFile(src.id, idx); }} aria-label="Remove"
                          className="absolute top-0.5 right-0.5 grid place-items-center w-4 h-4 rounded bg-black/70 text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"><Trash2 className="w-2.5 h-2.5" /></span>
                        {result?.byteSize && !result.error && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] font-mono text-white text-center py-0.5 leading-none">{formatBytes(result.byteSize)}</span>}
                      </button>
                    );
                  })}
                  <label className="shrink-0 w-14 h-[76px] rounded-lg border border-dashed border-[var(--border)] grid place-items-center text-[var(--text-mute)] hover:text-[var(--text-dim)] hover:border-[var(--text-faint)] cursor-pointer transition-colors" title={t.addMore}>
                    <Plus className="w-5 h-5" strokeWidth={1.5} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                  </label>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
