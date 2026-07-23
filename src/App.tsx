import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Download, Trash2, Crosshair, Plus, Terminal, Settings, MonitorSmartphone, LayoutGrid, Globe, Coffee, MoveHorizontal, MoveVertical, RotateCcw, RotateCw, AlertTriangle } from 'lucide-react';
import { processImage, GlobalOptions, ProcessedImage, DeviceType, DEVICES, Adjust, DEFAULT_ADJUST } from './lib/imageProcessor';
import { createZip } from './lib/zip';

type Language = 'EN' | 'CS' | 'DE' | 'ES' | 'FR' | 'ZH';
const LANGS: Language[] = ['EN', 'CS', 'DE', 'ES', 'FR', 'ZH'];

const TRANSLATIONS: Record<Language, any> = {
  EN: {
    title: "E-ink Convertor",
    format: "FORMAT: 24-BIT BMP",
    settings: "Settings",
    targetDevice: "Target Device",
    fillMode: "Scaling Logic",
    fill: "Fill Frame",
    contain: "Contain",
    zoom: "Scale Factor (Zoom)",
    background: "Background",
    bgBlack: "Black",
    bgWhite: "White",
    bgMirror: "Mirror",
    filters: "Visual Filters",
    invert: "Invert",
    dither: "Dithering",
    brightness: "Brightness",
    contrast: "Contrast",
    rotate: "Rotation",
    framing: "Framing (Selected)",
    uploadedImages: "Input Stream",
    items: "UNITS",
    uploadText: "Initialize Stream\n(Click or Drop)",
    ready: "Ready",
    failed: "Failed",
    addMore: "Append Data",
    livePreview: "Main Display // Render",
    processing: "Processing...",
    downloadAll: "Export All (ZIP)",
    downloadBmp: "Export BMP",
    awaitingSignal: "Awaiting Signal",
    incomingStream: "Incoming Data Stream",
    releaseToProcess: "RELEASE TO PROCESS",
    bitDepth: "Color Depth",
    bitDepth24: "24-bit BMP",
    bitDepth8: "8-bit BMP",
    noValidImages: "No valid image files.",
  },
  CS: {
    title: "Převodník pro E-ink",
    format: "FORMÁT: 24-BIT BMP",
    settings: "Nastavení",
    targetDevice: "Cílové zařízení",
    fillMode: "Způsob vyplnění",
    fill: "Vyplnit",
    contain: "Přizpůsobit",
    zoom: "Přiblížení (Zoom)",
    background: "Pozadí",
    bgBlack: "Černé",
    bgWhite: "Bílé",
    bgMirror: "Zrcadlení",
    filters: "Filtry obrazu",
    invert: "Invertovat",
    dither: "Dithering",
    brightness: "Jas",
    contrast: "Kontrast",
    rotate: "Otočení",
    framing: "Úprava snímku (vybraný)",
    uploadedImages: "Nahrané obrázky",
    items: "POLOŽEK",
    uploadText: "Nahrát obrázek\n(Klikni nebo přetáhni)",
    ready: "Připraveno",
    failed: "Chyba",
    addMore: "Přidat další",
    livePreview: "Živý náhled",
    processing: "Zpracovávám...",
    downloadAll: "Stáhnout vše (ZIP)",
    downloadBmp: "Stáhnout BMP",
    awaitingSignal: "Čekám na obrázek",
    incomingStream: "Příchozí datový proud",
    releaseToProcess: "PUSTĚTE PRO ZPRACOVÁNÍ",
    bitDepth: "Barevná hloubka",
    bitDepth24: "24-bit BMP",
    bitDepth8: "8-bit BMP",
    noValidImages: "Žádné platné obrázky.",
  },
  DE: {
    title: "E-ink Konverter",
    format: "FORMAT: 24-BIT BMP",
    settings: "Einstellungen",
    targetDevice: "Zielgerät",
    fillMode: "Skalierung",
    fill: "Ausfüllen",
    contain: "Anpassen",
    zoom: "Vergrößerung (Zoom)",
    background: "Hintergrund",
    bgBlack: "Schwarz",
    bgWhite: "Weiß",
    bgMirror: "Spiegeln",
    filters: "Bildfilter",
    invert: "Invertieren",
    dither: "Dithering",
    brightness: "Helligkeit",
    contrast: "Kontrast",
    rotate: "Drehung",
    framing: "Bildausschnitt (Ausgewählt)",
    uploadedImages: "Hochgeladene Bilder",
    items: "EINHEITEN",
    uploadText: "Bild hochladen\n(Klicken oder Ziehen)",
    ready: "Bereit",
    failed: "Fehler",
    addMore: "Mehr hinzufügen",
    livePreview: "Live-Vorschau",
    processing: "Verarbeitung...",
    downloadAll: "Alle laden (ZIP)",
    downloadBmp: "BMP herunterladen",
    awaitingSignal: "Warte auf Bild",
    incomingStream: "Eingehender Datenstrom",
    releaseToProcess: "LOSLASSEN ZUR VERARBEITUNG",
    bitDepth: "Farbtiefe",
    bitDepth24: "24-bit BMP",
    bitDepth8: "8-bit BMP",
    noValidImages: "Keine gültigen Bilddateien.",
  },
  ES: {
    title: "Convertidor E-ink",
    format: "FORMATO: 24-BIT BMP",
    settings: "Ajustes",
    targetDevice: "Dispositivo",
    fillMode: "Modo de escala",
    fill: "Llenar",
    contain: "Contener",
    zoom: "Acercar (Zoom)",
    background: "Fondo",
    bgBlack: "Negro",
    bgWhite: "Blanco",
    bgMirror: "Espejo",
    filters: "Filtros visuales",
    invert: "Invertir",
    dither: "Tramado",
    brightness: "Brillo",
    contrast: "Contraste",
    rotate: "Rotación",
    framing: "Encuadre (Seleccionado)",
    uploadedImages: "Imágenes cargadas",
    items: "UNIDADES",
    uploadText: "Cargar imagen\n(Clic o Arrastrar)",
    ready: "Listo",
    failed: "Error",
    addMore: "Añadir más",
    livePreview: "Vista previa",
    processing: "Procesando...",
    downloadAll: "Descargar todo (ZIP)",
    downloadBmp: "Descargar BMP",
    awaitingSignal: "Esperando imagen",
    incomingStream: "Flujo de datos entrante",
    releaseToProcess: "SOLTAR PARA PROCESAR",
    bitDepth: "Profundidad de color",
    bitDepth24: "24-bit BMP",
    bitDepth8: "8-bit BMP",
    noValidImages: "No hay imágenes válidas.",
  },
  FR: {
    title: "Convertisseur E-ink",
    format: "FORMAT: 24-BIT BMP",
    settings: "Paramètres",
    targetDevice: "Appareil",
    fillMode: "Remplissage",
    fill: "Remplir",
    contain: "Contenir",
    zoom: "Zoom",
    background: "Arrière-plan",
    bgBlack: "Noir",
    bgWhite: "Blanc",
    bgMirror: "Miroir",
    filters: "Filtres visuels",
    invert: "Inverser",
    dither: "Tramage",
    brightness: "Luminosité",
    contrast: "Contraste",
    rotate: "Rotation",
    framing: "Cadrage (Sélection)",
    uploadedImages: "Images téléchargées",
    items: "UNITÉS",
    uploadText: "Télécharger l'image\n(Cliquer ou Glisser)",
    ready: "Prêt",
    failed: "Échec",
    addMore: "Ajouter plus",
    livePreview: "Aperçu en direct",
    processing: "Traitement...",
    downloadAll: "Tout télécharger (ZIP)",
    downloadBmp: "Télécharger BMP",
    awaitingSignal: "En attente d'image",
    incomingStream: "Flux de données entrant",
    releaseToProcess: "RELACHER POUR TRAITER",
    bitDepth: "Profondeur de couleur",
    bitDepth24: "24-bit BMP",
    bitDepth8: "8-bit BMP",
    noValidImages: "Aucune image valide.",
  },
  ZH: {
    title: "电子墨水转换器",
    format: "格式: 24-BIT BMP",
    settings: "设置",
    targetDevice: "目标设备",
    fillMode: "填充模式",
    fill: "填充",
    contain: "适应",
    zoom: "缩放",
    background: "背景",
    bgBlack: "黑",
    bgWhite: "白",
    bgMirror: "镜像",
    filters: "视觉滤镜",
    invert: "反色",
    dither: "抖动处理",
    brightness: "亮度",
    contrast: "对比度",
    rotate: "旋转",
    framing: "构图（已选）",
    uploadedImages: "已上传图片",
    items: "项目",
    uploadText: "上传图片\n(点击或拖拽)",
    ready: "准备就绪",
    failed: "失败",
    addMore: "添加更多",
    livePreview: "实时预览",
    processing: "处理中...",
    downloadAll: "下载全部 (ZIP)",
    downloadBmp: "下载 BMP",
    awaitingSignal: "等待图片",
    incomingStream: "接收数据",
    releaseToProcess: "释放以处理",
    bitDepth: "色彩深度",
    bitDepth24: "24位 BMP",
    bitDepth8: "8位 BMP",
    noValidImages: "没有有效的图片文件。",
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
  const nav = (navigator.language || 'en').slice(0, 2).toUpperCase() as Language;
  return LANGS.includes(nav) ? nav : 'EN';
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ControlGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</div>
    {children}
  </div>
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
    bitDepth: 24,
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
        newFiles.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          adjust: { ...DEFAULT_ADJUST },
        });
      }
    }

    if (newFiles.length === 0) return;

    setSourceFiles(prev => {
      if (prev.length === 0) setSelectedIndex(0);
      return [...prev, ...newFiles];
    });
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
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
    const baseName = result.originalName.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}_${options.device}.bmp`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadAll = async () => {
    const valid = results.filter(r => r.bmpBlob);
    if (valid.length === 0) return;
    const entries = await Promise.all(valid.map(async r => {
      const baseName = r.originalName.replace(/\.[^/.]+$/, "");
      return {
        name: `${baseName}_${options.device}.bmp`,
        data: new Uint8Array(await r.bmpBlob!.arrayBuffer()),
      };
    }));
    const zip = createZip(entries);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eink_${options.device}_${valid.length}.zip`;
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
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    updateAdjust({ panX: adjust.panX + dx, panY: adjust.panY + dy });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePreviewMouseUp = () => setIsPreviewDragging(false);

  const selectedResult = selectedSource ? results.find(r => r.id === selectedSource.id) ?? null : null;
  const validCount = results.filter(r => r.bmpBlob).length;

  const toggleBtn = (active: boolean) =>
    `p-3 text-xs font-mono tracking-wider uppercase transition-all border rounded-xl ${
      active
        ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
        : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
    }`;

  return (
    <div
      className="relative min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-zinc-800 p-4 md:p-6 lg:p-8"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/90 backdrop-blur-sm border border-white/20 m-4 flex flex-col items-center justify-center">
          <UploadCloud className="w-12 h-12 text-white mb-6 animate-pulse" strokeWidth={1} />
          <div className="font-mono text-sm uppercase tracking-[0.3em] text-white">{t.incomingStream}</div>
          <div className="font-mono text-[10px] text-zinc-500 mt-2">{t.releaseToProcess}</div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto flex flex-col lg:h-[calc(100vh-4rem)]">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-y-3 bg-[#111] border border-zinc-800 rounded-2xl px-4 sm:px-6 py-4 mb-6 shrink-0 shadow-lg">
          <div className="flex items-center gap-4 text-zinc-100">
            <Crosshair className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
            <h1 className="text-base sm:text-xl font-medium tracking-[0.2em] uppercase">{t.title}</h1>
          </div>
          <div className="font-mono text-xs text-zinc-400 flex flex-wrap gap-3 sm:gap-6 items-center">

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-950 p-1 rounded-md">
              <Globe className="w-3.5 h-3.5 text-zinc-500 ml-1 mr-1" strokeWidth={1.5} />
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-label={`Language ${l}`}
                  className={`px-2 py-1 text-[10px] tracking-wider rounded transition-colors ${
                    lang === l ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <a
              href="https://buymeacoffee.com/destroywrld"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-yellow-900/50 bg-yellow-950/20 text-yellow-500 hover:bg-yellow-900/40 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-md text-[10px] tracking-widest uppercase font-bold"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buy me a coffee</span>
            </a>

            <span className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> ONLINE
            </span>
            <span className="hidden lg:inline bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-[10px] tracking-widest uppercase">{t.format.replace('24', options.bitDepth.toString())}</span>
          </div>
        </header>

        {/* Main Interface */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

          {/* Left Column: Settings */}
          <div className="w-full lg:w-[320px] flex flex-col gap-8 shrink-0 lg:overflow-y-auto custom-scrollbar bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-white border-b border-zinc-800 pb-4">
              <Settings className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
              <h2 className="font-mono text-xs uppercase tracking-widest font-semibold">{t.settings}</h2>
            </div>

            <ControlGroup label={t.targetDevice}>
              <div className="grid grid-cols-2 gap-2">
                {(['X4', 'X3'] as DeviceType[]).map(dev => (
                  <button
                    key={dev}
                    onClick={() => setOptions({ ...options, device: dev })}
                    className={`p-3 text-left transition-all border rounded-xl ${
                      options.device === dev
                        ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-sm font-mono tracking-wider">{dev}</div>
                    <div className="text-[10px] font-mono mt-1 text-zinc-600">
                      {DEVICES[dev].width}x{DEVICES[dev].height}
                    </div>
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label={t.bitDepth}>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOptions({ ...options, bitDepth: 8 })} className={toggleBtn(options.bitDepth === 8) + ' text-[10px] flex items-center justify-center'}>
                  {t.bitDepth8}
                </button>
                <button onClick={() => setOptions({ ...options, bitDepth: 24 })} className={toggleBtn(options.bitDepth === 24) + ' text-[10px] flex items-center justify-center'}>
                  {t.bitDepth24}
                </button>
              </div>
            </ControlGroup>

            <ControlGroup label={t.fillMode}>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOptions({ ...options, fitMode: 'cover' })} className={toggleBtn(options.fitMode === 'cover')}>{t.fill}</button>
                <button onClick={() => setOptions({ ...options, fitMode: 'contain' })} className={toggleBtn(options.fitMode === 'contain')}>{t.contain}</button>
              </div>
            </ControlGroup>

            {options.fitMode === 'contain' && (
              <ControlGroup label={t.background}>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setOptions({ ...options, backgroundFill: 'mirror' })} className={toggleBtn(options.backgroundFill === 'mirror') + ' text-[10px] flex items-center justify-center gap-1'}>
                    <LayoutGrid className="w-3 h-3 opacity-70" />{t.bgMirror}
                  </button>
                  <button onClick={() => setOptions({ ...options, backgroundFill: 'black' })} className={toggleBtn(options.backgroundFill === 'black') + ' text-[10px] flex items-center justify-center gap-1'}>
                    <div className="w-2 h-2 bg-black rounded-full border border-zinc-600" />{t.bgBlack}
                  </button>
                  <button onClick={() => setOptions({ ...options, backgroundFill: 'white' })} className={toggleBtn(options.backgroundFill === 'white') + ' text-[10px] flex items-center justify-center gap-1'}>
                    <div className="w-2 h-2 bg-white rounded-full border border-zinc-300" />{t.bgWhite}
                  </button>
                </div>
              </ControlGroup>
            )}

            {/* Brightness / Contrast */}
            <ControlGroup label={`${t.brightness} / ${t.contrast}`}>
              <div className="p-5 border border-zinc-700 bg-zinc-950 rounded-xl flex flex-col gap-4">
                <SliderRow label={t.brightness} value={options.brightness} min={-100} max={100}
                  onChange={(v) => setOptions({ ...options, brightness: v })} />
                <SliderRow label={t.contrast} value={options.contrast} min={-100} max={100}
                  onChange={(v) => setOptions({ ...options, contrast: v })} />
              </div>
            </ControlGroup>

            <ControlGroup label={t.filters}>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setOptions({ ...options, invert: !options.invert })}
                  aria-pressed={options.invert}
                  className={`flex items-center justify-between p-4 border rounded-xl text-xs font-mono tracking-wider transition-colors ${
                    options.invert ? 'bg-zinc-100 border-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="font-bold">{t.invert}</span>
                  <div className={`w-3 h-3 rounded-sm ${options.invert ? 'bg-black' : 'bg-zinc-800 border border-zinc-600'}`} />
                </button>
                <button
                  onClick={() => setOptions({ ...options, dither: !options.dither })}
                  aria-pressed={options.dither}
                  className={`flex items-center justify-between p-4 border rounded-xl text-xs font-mono tracking-wider transition-colors ${
                    options.dither ? 'bg-zinc-100 border-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="font-bold">{t.dither}</span>
                  <div className={`w-3 h-3 rounded-sm ${options.dither ? 'bg-black' : 'bg-zinc-800 border border-zinc-600'}`} />
                </button>
              </div>
            </ControlGroup>

            {/* Per-image framing */}
            <ControlGroup label={t.framing}>
              <div className={`p-5 border border-zinc-700 bg-zinc-950 rounded-xl flex flex-col gap-4 ${selectedSource ? '' : 'opacity-40 pointer-events-none'}`}>
                {/* Rotation */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>{t.rotate}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateAdjust({ rotate: (adjust.rotate + 270) % 360 })} className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors" aria-label="Rotate left"><RotateCcw className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-white font-bold">{adjust.rotate}°</span>
                    <button onClick={() => updateAdjust({ rotate: (adjust.rotate + 90) % 360 })} className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors" aria-label="Rotate right"><RotateCw className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="border-t border-zinc-800" />

                {/* Zoom */}
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>ZOOM</span>
                    <button
                      onClick={() => updateAdjust({ ...DEFAULT_ADJUST, rotate: adjust.rotate })}
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">
                    <input
                      type="number"
                      value={adjust.scale}
                      onChange={(e) => updateAdjust({ scale: parseInt(e.target.value) || 100 })}
                      className="bg-transparent w-10 text-right text-white font-bold outline-none"
                    />
                    <span className="ml-0.5">%</span>
                  </div>
                </div>
                <input
                  type="range" min="50" max="200" step="1"
                  value={adjust.scale}
                  onChange={(e) => updateAdjust({ scale: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />

                <SliderRow icon={<MoveHorizontal className="w-3.5 h-3.5" />} value={adjust.panX} min={-800} max={800}
                  onChange={(v) => updateAdjust({ panX: v })} />
                <SliderRow icon={<MoveVertical className="w-3.5 h-3.5" />} value={adjust.panY} min={-800} max={800}
                  onChange={(v) => updateAdjust({ panY: v })} />
              </div>
            </ControlGroup>
          </div>

          {/* Middle Column: Input Stream */}
          <div className="w-full lg:w-[320px] flex flex-col shrink-0 bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-lg lg:max-h-full">
            <div className="flex items-center justify-between text-white border-b border-zinc-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                <h2 className="font-mono text-xs uppercase tracking-widest font-semibold">{t.uploadedImages}</h2>
              </div>
              <span className="font-mono text-[10px] bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-zinc-300">{results.length} {t.items}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[200px] pr-2 custom-scrollbar">
              {sourceFiles.length === 0 ? (
                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-600 transition-colors cursor-pointer group min-h-[200px] rounded-lg">
                  <UploadCloud className="w-8 h-8 text-zinc-600 group-hover:text-zinc-300 mb-4 transition-colors" strokeWidth={1} />
                  <span className="font-mono text-[11px] text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest text-center leading-relaxed whitespace-pre-line">
                    {t.uploadText}
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                </label>
              ) : (
                <>
                  {sourceFiles.map((src, idx) => {
                    const result = results.find(r => r.id === src.id);
                    const hasError = result?.error;
                    return (
                      <div
                        key={src.id}
                        onClick={() => setSelectedIndex(idx)}
                        className={`group flex items-stretch gap-3 p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedIndex === idx ? 'border-zinc-300 bg-zinc-900 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'border-zinc-800 hover:border-zinc-600 bg-[#0a0a0a]'
                        }`}
                      >
                        <div className="w-12 h-16 shrink-0 bg-[#050505] flex items-center justify-center p-0.5 border border-zinc-800 rounded-sm overflow-hidden">
                          {hasError ? (
                            <AlertTriangle className="w-5 h-5 text-red-500/70" />
                          ) : result?.dataUrl ? (
                            <img src={result.dataUrl} alt={src.file.name} className={`w-full h-full object-contain transition-opacity duration-200 ${selectedIndex === idx ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                          ) : (
                            <div className="w-3 h-3 border border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className={`text-[11px] truncate font-mono tracking-wide ${selectedIndex === idx ? 'text-white font-bold' : 'text-zinc-400'}`}>{src.file.name}</div>
                          <div className={`text-[9px] font-mono mt-1 tracking-wider uppercase ${hasError ? 'text-red-500/80' : 'text-zinc-600'}`}>
                            {hasError ? t.failed : result?.byteSize ? formatBytes(result.byteSize) : t.ready}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(src.id, idx); }}
                          aria-label="Remove"
                          className="px-3 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}

                  <label className="flex items-center justify-center gap-3 p-4 border border-dashed border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-600 hover:text-zinc-200 cursor-pointer text-[11px] font-mono uppercase tracking-widest transition-colors mt-2 rounded-lg">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addMore}</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileSelect} />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="flex-1 flex flex-col bg-[#111] border border-zinc-800 rounded-2xl p-6 min-h-[400px] shadow-lg">
            <div className="flex items-center justify-between text-white border-b border-zinc-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                <h2 className="font-mono text-xs uppercase tracking-widest font-semibold">{t.livePreview}</h2>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                {isProcessing && (
                  <span className="text-[10px] font-mono text-green-400 animate-pulse tracking-widest uppercase">{t.processing}</span>
                )}
                {validCount > 1 && (
                  <button onClick={downloadAll} disabled={isProcessing} className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                    {t.downloadAll}
                  </button>
                )}
                {selectedResult?.bmpBlob && (
                  <button
                    onClick={() => downloadSingle(selectedResult)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2 bg-zinc-100 text-black text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-md"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t.downloadBmp}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 bg-[#050505] border border-zinc-800 rounded-xl relative flex flex-col items-center justify-center overflow-hidden p-8 group shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] min-h-[300px]">
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.2 }} />
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-zinc-700/50 m-4 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-zinc-700/50 m-4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-zinc-700/50 m-4 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-zinc-700/50 m-4 pointer-events-none" />

              {selectedResult?.error ? (
                <div className="relative flex flex-col items-center justify-center text-red-500/70 z-10">
                  <AlertTriangle className="w-10 h-10 mb-6" strokeWidth={1} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t.failed}</span>
                </div>
              ) : selectedResult?.dataUrl ? (
                <>
                  <div
                    className={`relative bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-[8px] ring-[#1a1a1a] border border-zinc-700 transition-all z-10 overflow-hidden ${isPreviewDragging ? 'cursor-grabbing duration-0' : 'cursor-grab duration-300'}`}
                    style={{ aspectRatio: `${DEVICES[options.device].width} / ${DEVICES[options.device].height}`, maxHeight: '100%', maxWidth: '100%' }}
                    onMouseDown={handlePreviewMouseDown}
                    onMouseMove={handlePreviewMouseMove}
                    onMouseUp={handlePreviewMouseUp}
                    onMouseLeave={handlePreviewMouseUp}
                  >
                    <img src={selectedResult.dataUrl} className="block w-full h-full object-cover pointer-events-none" alt="Preview" />
                  </div>

                  <div className="absolute bottom-6 left-6 flex items-center gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-500" />RES: {DEVICES[options.device].width}x{DEVICES[options.device].height}</span>
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-500" />FMT: {options.bitDepth}-BIT BMP</span>
                    {selectedResult.byteSize && (
                      <span className="hidden sm:flex items-center gap-2"><div className="w-1 h-1 bg-zinc-500" />{formatBytes(selectedResult.byteSize)}</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="relative flex flex-col items-center justify-center text-zinc-700 z-10">
                  <Terminal className="w-10 h-10 mb-6 opacity-30" strokeWidth={1} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-50">{t.awaitingSignal}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const SliderRow = ({ label, icon, value, min, max, onChange }: { label?: string; icon?: React.ReactNode; value: number; min: number; max: number; onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
      <span className="flex items-center gap-1">{icon}{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-right w-16 text-white font-bold outline-none"
      />
    </div>
    <input
      type="range" min={min} max={max} step="1"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
    />
  </div>
);
