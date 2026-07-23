import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Download, Trash2, Crosshair, Plus, Terminal, Sliders, Globe, Coffee, RotateCcw, RotateCw, AlertTriangle, FileArchive, ZoomIn } from 'lucide-react';
import { processImage, GlobalOptions, ProcessedImage, DeviceType, DEVICES, Adjust, DEFAULT_ADJUST } from './lib/imageProcessor';
import { createZip } from './lib/zip';

type Language = 'EN' | 'CS' | 'DE' | 'ES' | 'FR' | 'ZH';
const LANGS: Language[] = ['EN', 'CS', 'DE', 'ES', 'FR', 'ZH'];

const TRANSLATIONS: Record<Language, any> = {
  EN: {
    title: "InkFrame",
    settings: "Settings",
    targetDevice: "Target Device",
    fillMode: "Scaling",
    fill: "Fill",
    contain: "Contain",
    zoom: "Zoom",
    background: "Background",
    bgBlack: "Black",
    bgWhite: "White",
    bgMirror: "Mirror",
    filters: "Filters",
    invert: "Invert",
    dither: "Dither",
    brightness: "Brightness",
    contrast: "Contrast",
    rotate: "Rotate",
    reset: "Reset framing",
    library: "Images",
    ready: "Ready",
    failed: "Failed",
    addMore: "Add images",
    dropHint: "Drop images here or click to browse",
    preview: "Preview",
    processing: "Processing…",
    downloadAll: "ZIP",
    downloadBmp: "Download BMP",
    awaitingSignal: "Drop an image to begin",
    incomingStream: "Drop to import",
    releaseToProcess: "Release to process",
    bitDepth: "Format",
    bitDepth24: "24-bit",
    bitDepth8: "8-bit",
    dragToPan: "Drag the preview to reposition",
  },
  CS: {
    title: "InkFrame",
    settings: "Nastavení",
    targetDevice: "Cílové zařízení",
    fillMode: "Vyplnění",
    fill: "Vyplnit",
    contain: "Přizpůsobit",
    zoom: "Zoom",
    background: "Pozadí",
    bgBlack: "Černé",
    bgWhite: "Bílé",
    bgMirror: "Zrcadlení",
    filters: "Filtry",
    invert: "Invert",
    dither: "Dither",
    brightness: "Jas",
    contrast: "Kontrast",
    rotate: "Otočit",
    reset: "Reset úprav",
    library: "Obrázky",
    ready: "Hotovo",
    failed: "Chyba",
    addMore: "Přidat obrázky",
    dropHint: "Přetáhni obrázky sem nebo klikni pro výběr",
    preview: "Náhled",
    processing: "Zpracovávám…",
    downloadAll: "ZIP",
    downloadBmp: "Stáhnout BMP",
    awaitingSignal: "Začni přetažením obrázku",
    incomingStream: "Pusť pro import",
    releaseToProcess: "Pusť pro zpracování",
    bitDepth: "Formát",
    bitDepth24: "24-bit",
    bitDepth8: "8-bit",
    dragToPan: "Tažením v náhledu obrázek posuneš",
  },
  DE: {
    title: "InkFrame",
    settings: "Einstellungen",
    targetDevice: "Zielgerät",
    fillMode: "Skalierung",
    fill: "Füllen",
    contain: "Anpassen",
    zoom: "Zoom",
    background: "Hintergrund",
    bgBlack: "Schwarz",
    bgWhite: "Weiß",
    bgMirror: "Spiegeln",
    filters: "Filter",
    invert: "Invert",
    dither: "Dither",
    brightness: "Helligkeit",
    contrast: "Kontrast",
    rotate: "Drehen",
    reset: "Zurücksetzen",
    library: "Bilder",
    ready: "Fertig",
    failed: "Fehler",
    addMore: "Bilder hinzufügen",
    dropHint: "Bilder hierher ziehen oder klicken",
    preview: "Vorschau",
    processing: "Verarbeitung…",
    downloadAll: "ZIP",
    downloadBmp: "BMP laden",
    awaitingSignal: "Bild ablegen zum Start",
    incomingStream: "Zum Importieren ablegen",
    releaseToProcess: "Loslassen zum Verarbeiten",
    bitDepth: "Format",
    bitDepth24: "24-bit",
    bitDepth8: "8-bit",
    dragToPan: "Vorschau ziehen zum Verschieben",
  },
  ES: {
    title: "InkFrame",
    settings: "Ajustes",
    targetDevice: "Dispositivo",
    fillMode: "Escala",
    fill: "Llenar",
    contain: "Contener",
    zoom: "Zoom",
    background: "Fondo",
    bgBlack: "Negro",
    bgWhite: "Blanco",
    bgMirror: "Espejo",
    filters: "Filtros",
    invert: "Invert",
    dither: "Dither",
    brightness: "Brillo",
    contrast: "Contraste",
    rotate: "Rotar",
    reset: "Restablecer",
    library: "Imágenes",
    ready: "Listo",
    failed: "Error",
    addMore: "Añadir imágenes",
    dropHint: "Arrastra imágenes o haz clic",
    preview: "Vista previa",
    processing: "Procesando…",
    downloadAll: "ZIP",
    downloadBmp: "Descargar BMP",
    awaitingSignal: "Suelta una imagen para empezar",
    incomingStream: "Suelta para importar",
    releaseToProcess: "Suelta para procesar",
    bitDepth: "Formato",
    bitDepth24: "24-bit",
    bitDepth8: "8-bit",
    dragToPan: "Arrastra la vista para reposicionar",
  },
  FR: {
    title: "InkFrame",
    settings: "Paramètres",
    targetDevice: "Appareil",
    fillMode: "Échelle",
    fill: "Remplir",
    contain: "Contenir",
    zoom: "Zoom",
    background: "Arrière-plan",
    bgBlack: "Noir",
    bgWhite: "Blanc",
    bgMirror: "Miroir",
    filters: "Filtres",
    invert: "Invert",
    dither: "Dither",
    brightness: "Luminosité",
    contrast: "Contraste",
    rotate: "Pivoter",
    reset: "Réinitialiser",
    library: "Images",
    ready: "Prêt",
    failed: "Échec",
    addMore: "Ajouter des images",
    dropHint: "Glissez des images ou cliquez",
    preview: "Aperçu",
    processing: "Traitement…",
    downloadAll: "ZIP",
    downloadBmp: "Télécharger BMP",
    awaitingSignal: "Déposez une image pour commencer",
    incomingStream: "Déposez pour importer",
    releaseToProcess: "Relâchez pour traiter",
    bitDepth: "Format",
    bitDepth24: "24-bit",
    bitDepth8: "8-bit",
    dragToPan: "Glissez l'aperçu pour repositionner",
  },
  ZH: {
    title: "InkFrame",
    settings: "设置",
    targetDevice: "目标设备",
    fillMode: "缩放",
    fill: "填充",
    contain: "适应",
    zoom: "缩放",
    background: "背景",
    bgBlack: "黑",
    bgWhite: "白",
    bgMirror: "镜像",
    filters: "滤镜",
    invert: "反色",
    dither: "抖动",
    brightness: "亮度",
    contrast: "对比度",
    rotate: "旋转",
    reset: "重置",
    library: "图片",
    ready: "就绪",
    failed: "失败",
    addMore: "添加图片",
    dropHint: "拖入图片或点击选择",
    preview: "预览",
    processing: "处理中…",
    downloadAll: "ZIP",
    downloadBmp: "下载 BMP",
    awaitingSignal: "拖入图片开始",
    incomingStream: "松开以导入",
    releaseToProcess: "松开以处理",
    bitDepth: "格式",
    bitDepth24: "24位",
    bitDepth8: "8位",
    dragToPan: "拖动预览可移动图片",
  }
};

interface SourceFile {
  id: string;
  file: File;
  adjust: Adjust;
}

interface Result extends Partial<ProcessedImage> {
  id: string;
  originalName: string;
  error?: boolean;
}

const getInitialLang = (): Language => {
  try {
    const saved = localStorage.getItem('eink-lang') as Language | null;
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  // Default to English; a manual switch is remembered in localStorage.
  return 'EN';
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/** Small labeled section in the sidebar. */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">{label}</div>
    {children}
  </div>
);

/** Segmented control (pill group). */
function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            value === o.value
              ? 'bg-zinc-100 text-black font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Compact slider with numeric readout. */
const Slider = ({ value, min, max, onChange, accent }: { value: number; min: number; max: number; onChange: (v: number) => void; accent?: boolean }) => (
  <input
    type="range" min={min} max={max} step={1} value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    className={`w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full ${accent ? '[&::-webkit-slider-thumb]:bg-white' : '[&::-webkit-slider-thumb]:bg-zinc-400'} hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform`}
  />
);

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLang);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try { localStorage.setItem('eink-lang', lang); } catch { /* ignore */ }
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const [options, setOptions] = useState<GlobalOptions>({
    device: 'X4',
    fitMode: 'cover',
    invert: false,
    dither: false,
    backgroundFill: 'mirror',
    bitDepth: 8,
    brightness: 0,
    contrast: 0,
  });

  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;
    const processAll = async () => {
      if (sourceFiles.length === 0) {
        if (isMounted) setResults([]);
        return;
      }
      setIsProcessing(true);
      const newResults: Result[] = [];
      for (const src of sourceFiles) {
        try {
          const result = await processImage(src.file, options, src.adjust);
          newResults.push({ ...result, id: src.id });
        } catch (err) {
          console.error('Error processing image:', err);
          newResults.push({ id: src.id, originalName: src.file.name, error: true });
        }
      }
      if (isMounted) {
        setResults(newResults);
        setIsProcessing(false);
      }
    };
    const timer = setTimeout(processAll, 150);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [sourceFiles, options]);

  const selectedSource = sourceFiles[selectedIndex] ?? null;
  const adjust = selectedSource?.adjust ?? DEFAULT_ADJUST;

  const updateAdjust = (patch: Partial<Adjust>) => {
    setSourceFiles(prev => prev.map((s, i) => i === selectedIndex ? { ...s, adjust: { ...s.adjust, ...patch } } : s));
  };

  const handleAddFiles = (files: FileList | File[]) => {
    const newFiles: SourceFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`, file, adjust: { ...DEFAULT_ADJUST } });
      }
    }
    if (newFiles.length === 0) return;
    setSourceFiles(prev => {
      if (prev.length === 0) setSelectedIndex(0);
      return [...prev, ...newFiles];
    });
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleAddFiles(e.dataTransfer.files);
  }, []);
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleAddFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (id: string, index: number) => {
    setSourceFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIndex(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const downloadSingle = (result: Result) => {
    if (!result.bmpBlob) return;
    const url = URL.createObjectURL(result.bmpBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.originalName.replace(/\.[^/.]+$/, "")}_${options.device}.bmp`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadAll = async () => {
    const valid = results.filter(r => r.bmpBlob);
    if (valid.length === 0) return;
    const entries = await Promise.all(valid.map(async r => ({
      name: `${r.originalName.replace(/\.[^/.]+$/, "")}_${options.device}.bmp`,
      data: new Uint8Array(await r.bmpBlob!.arrayBuffer()),
    })));
    const url = URL.createObjectURL(createZip(entries));
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkframe_${options.device}_${valid.length}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPreviewDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!isPreviewDragging) return;
    updateAdjust({ panX: adjust.panX + (e.clientX - dragStart.x), panY: adjust.panY + (e.clientY - dragStart.y) });
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handlePreviewMouseUp = () => setIsPreviewDragging(false);

  const selectedResult = selectedSource ? results.find(r => r.id === selectedSource.id) ?? null : null;
  const validCount = results.filter(r => r.bmpBlob).length;
  const dev = DEVICES[options.device];

  return (
    <div
      className="relative min-h-screen bg-[#070707] text-zinc-400 font-sans selection:bg-zinc-700 p-3 sm:p-4 lg:p-6"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60" style={{ background: 'radial-gradient(1000px 600px at 70% -10%, rgba(59,130,246,0.06), transparent 60%), radial-gradient(800px 500px at 0% 100%, rgba(244,244,245,0.03), transparent 55%)' }} />

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[#070707]/92 backdrop-blur-sm border-2 border-dashed border-white/25 m-3 rounded-3xl flex flex-col items-center justify-center">
          <UploadCloud className="w-14 h-14 text-white mb-5 animate-bounce" strokeWidth={1} />
          <div className="font-mono text-sm uppercase tracking-[0.3em] text-white">{t.incomingStream}</div>
          <div className="font-mono text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">{t.releaseToProcess}</div>
        </div>
      )}

      <div className="relative max-w-[1500px] mx-auto flex flex-col gap-4 lg:h-[calc(100vh-3rem)]">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 bg-[#101012] border border-zinc-800/80 rounded-2xl px-4 sm:px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 text-zinc-100">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-zinc-100 text-black">
              <Crosshair className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm sm:text-base font-semibold tracking-[0.15em] uppercase">{t.title}</h1>
              <div className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase">E-ink · Xteink X3 / X4</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-0.5 border border-zinc-800 bg-zinc-950 p-0.5 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-zinc-600 mx-1" strokeWidth={1.5} />
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-label={`Language ${l}`}
                  className={`px-1.5 py-1 text-[10px] font-mono tracking-wider rounded-md transition-colors ${lang === l ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >{l}</button>
              ))}
            </div>
            <a
              href="https://buymeacoffee.com/destroywrld"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-amber-800/40 bg-amber-950/20 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 transition-colors px-2.5 py-1.5 rounded-lg text-[10px] tracking-widest uppercase font-bold"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Coffee</span>
            </a>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

          {/* Sidebar — global settings only */}
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5 bg-[#101012] border border-zinc-800/80 rounded-2xl p-5 lg:overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2.5 text-zinc-200">
              <Sliders className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold">{t.settings}</h2>
            </div>

            <Field label={t.targetDevice}>
              <Segmented
                value={options.device}
                onChange={(device) => setOptions({ ...options, device })}
                options={(['X4', 'X3'] as DeviceType[]).map(d => ({
                  value: d,
                  label: <span className="flex flex-col leading-tight"><span>{d}</span><span className="text-[8px] opacity-60">{DEVICES[d].width}×{DEVICES[d].height}</span></span>,
                }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t.fillMode}>
                <Segmented
                  value={options.fitMode}
                  onChange={(fitMode) => setOptions({ ...options, fitMode })}
                  options={[{ value: 'cover', label: t.fill }, { value: 'contain', label: t.contain }]}
                />
              </Field>
              <Field label={t.bitDepth}>
                <Segmented
                  value={String(options.bitDepth)}
                  onChange={(v) => setOptions({ ...options, bitDepth: parseInt(v) as 8 | 24 })}
                  options={[{ value: '24', label: t.bitDepth24 }, { value: '8', label: t.bitDepth8 }]}
                />
              </Field>
            </div>

            {options.fitMode === 'contain' && (
              <Field label={t.background}>
                <Segmented
                  value={options.backgroundFill}
                  onChange={(backgroundFill) => setOptions({ ...options, backgroundFill: backgroundFill as GlobalOptions['backgroundFill'] })}
                  options={[
                    { value: 'mirror', label: t.bgMirror },
                    { value: 'black', label: t.bgBlack },
                    { value: 'white', label: t.bgWhite },
                  ]}
                />
              </Field>
            )}

            <Field label={`${t.brightness} · ${t.contrast}`}>
              <div className="space-y-3 p-3.5 border border-zinc-800 bg-zinc-950 rounded-xl">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1.5"><span>{t.brightness}</span><span className="text-zinc-200 font-bold">{options.brightness > 0 ? '+' : ''}{options.brightness}</span></div>
                  <Slider value={options.brightness} min={-100} max={100} onChange={(v) => setOptions({ ...options, brightness: v })} />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1.5"><span>{t.contrast}</span><span className="text-zinc-200 font-bold">{options.contrast > 0 ? '+' : ''}{options.contrast}</span></div>
                  <Slider value={options.contrast} min={-100} max={100} onChange={(v) => setOptions({ ...options, contrast: v })} />
                </div>
              </div>
            </Field>

            <Field label={t.filters}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOptions({ ...options, invert: !options.invert })}
                  aria-pressed={options.invert}
                  className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${options.invert ? 'bg-zinc-100 border-zinc-100 text-black font-semibold' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${options.invert ? 'bg-black' : 'bg-zinc-600'}`} />{t.invert}
                </button>
                <button
                  onClick={() => setOptions({ ...options, dither: !options.dither })}
                  aria-pressed={options.dither}
                  className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${options.dither ? 'bg-zinc-100 border-zinc-100 text-black font-semibold' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${options.dither ? 'bg-black' : 'bg-zinc-600'}`} />{t.dither}
                </button>
              </div>
            </Field>
          </aside>

          {/* Preview column */}
          <section className="flex-1 flex flex-col gap-4 min-h-0">

            {/* Stage */}
            <div className="flex-1 flex flex-col bg-[#101012] border border-zinc-800/80 rounded-2xl overflow-hidden min-h-[320px]">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-zinc-800/80 shrink-0">
                {/* Framing controls (per selected image) */}
                <div className={`flex items-center gap-1.5 ${selectedSource && !selectedResult?.error ? '' : 'opacity-40 pointer-events-none'}`}>
                  <ToolBtn onClick={() => updateAdjust({ rotate: (adjust.rotate + 270) % 360 })} label={t.rotate + ' ⟲'}><RotateCcw className="w-4 h-4" /></ToolBtn>
                  <ToolBtn onClick={() => updateAdjust({ rotate: (adjust.rotate + 90) % 360 })} label={t.rotate + ' ⟳'}><RotateCw className="w-4 h-4" /></ToolBtn>
                  <div className="w-px h-5 bg-zinc-800 mx-1" />
                  <ZoomIn className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="range" min={50} max={200} step={1} value={adjust.scale}
                    onChange={(e) => updateAdjust({ scale: parseInt(e.target.value) })}
                    className="w-24 sm:w-32 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <span className="font-mono text-[11px] text-zinc-300 w-9 tabular-nums">{adjust.scale}%</span>
                  <ToolBtn onClick={() => updateAdjust({ ...DEFAULT_ADJUST })} label={t.reset}><RotateCcw className="w-3.5 h-3.5" /></ToolBtn>
                </div>

                {/* Downloads */}
                <div className="flex items-center gap-3">
                  {isProcessing && <span className="text-[10px] font-mono text-emerald-400 animate-pulse tracking-widest uppercase">{t.processing}</span>}
                  {validCount > 1 && (
                    <button onClick={downloadAll} disabled={isProcessing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-mono uppercase tracking-widest text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50">
                      <FileArchive className="w-3.5 h-3.5" />{t.downloadAll}
                    </button>
                  )}
                  {selectedResult?.bmpBlob && (
                    <button onClick={() => downloadSingle(selectedResult)} disabled={isProcessing} className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 text-black text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-white active:scale-95 transition-all disabled:opacity-50 rounded-lg">
                      <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span className="hidden sm:inline">{t.downloadBmp}</span>
                      <span className="sm:hidden">BMP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview surface */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6 sm:p-10">
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #23232a 1px, transparent 1px)', backgroundSize: '26px 26px', opacity: 0.25 }} />

                {selectedResult?.error ? (
                  <div className="relative flex flex-col items-center text-red-500/80 z-10">
                    <AlertTriangle className="w-10 h-10 mb-4" strokeWidth={1} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t.failed}</span>
                  </div>
                ) : selectedResult?.dataUrl ? (
                  <>
                    <div
                      className={`relative bg-white shadow-[0_10px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 rounded-[2px] transition-transform z-10 overflow-hidden ${isPreviewDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ aspectRatio: `${dev.width} / ${dev.height}`, maxHeight: '100%', maxWidth: '100%' }}
                      onMouseDown={handlePreviewMouseDown}
                      onMouseMove={handlePreviewMouseMove}
                      onMouseUp={handlePreviewMouseUp}
                      onMouseLeave={handlePreviewMouseUp}
                    >
                      <img src={selectedResult.dataUrl} className="block w-full h-full object-cover pointer-events-none select-none" alt={selectedResult.originalName} draggable={false} />
                    </div>

                    {/* Info bar */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
                      <span className="truncate max-w-[40%] text-zinc-400 normal-case tracking-normal">{selectedResult.originalName}</span>
                      <span className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <span>{dev.width}×{dev.height}</span>
                        <span>{options.bitDepth}-bit</span>
                        {selectedResult.byteSize && <span className="text-zinc-400">{formatBytes(selectedResult.byteSize)}</span>}
                      </span>
                    </div>
                  </>
                ) : (
                  <label className="relative z-10 flex flex-col items-center justify-center text-zinc-600 cursor-pointer group">
                    <div className="grid place-items-center w-16 h-16 rounded-2xl border border-dashed border-zinc-700 group-hover:border-zinc-500 transition-colors mb-5">
                      <Terminal className="w-7 h-7 opacity-50 group-hover:opacity-80 transition-opacity" strokeWidth={1} />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">{t.awaitingSignal}</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                  </label>
                )}
              </div>
            </div>

            {/* Filmstrip */}
            <div className="shrink-0 bg-[#101012] border border-zinc-800/80 rounded-2xl p-3">
              {sourceFiles.length === 0 ? (
                <label className="flex items-center justify-center gap-3 h-[76px] border border-dashed border-zinc-800 rounded-xl text-[11px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/30 cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4" />{t.dropHint}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                </label>
              ) : (
                <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                  <div className="flex items-center gap-1 pr-1 shrink-0">
                    <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest -rotate-0">{t.library}</span>
                    <span className="font-mono text-[9px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{results.length}</span>
                  </div>
                  {sourceFiles.map((src, idx) => {
                    const result = results.find(r => r.id === src.id);
                    const selected = selectedIndex === idx;
                    return (
                      <button
                        key={src.id}
                        onClick={() => setSelectedIndex(idx)}
                        className={`group relative shrink-0 w-14 h-[76px] rounded-lg overflow-hidden border transition-all ${selected ? 'border-zinc-100 ring-2 ring-zinc-100/20' : 'border-zinc-800 hover:border-zinc-600'}`}
                        title={src.file.name}
                      >
                        <div className="absolute inset-0 bg-[#050505] grid place-items-center">
                          {result?.error ? (
                            <AlertTriangle className="w-4 h-4 text-red-500/70" />
                          ) : result?.dataUrl ? (
                            <img src={result.dataUrl} alt={src.file.name} className={`w-full h-full object-cover ${selected ? '' : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
                          ) : (
                            <div className="w-3.5 h-3.5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
                          )}
                        </div>
                        <span
                          onClick={(e) => { e.stopPropagation(); removeFile(src.id, idx); }}
                          className="absolute top-0.5 right-0.5 grid place-items-center w-4 h-4 rounded bg-black/70 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </span>
                        {result?.byteSize && !result.error && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] font-mono text-zinc-300 text-center py-0.5 leading-none">{formatBytes(result.byteSize)}</span>
                        )}
                      </button>
                    );
                  })}
                  <label className="shrink-0 w-14 h-[76px] rounded-lg border border-dashed border-zinc-800 grid place-items-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/30 cursor-pointer transition-colors" title={t.addMore}>
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

const ToolBtn = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="grid place-items-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-900 transition-colors"
  >
    {children}
  </button>
);
