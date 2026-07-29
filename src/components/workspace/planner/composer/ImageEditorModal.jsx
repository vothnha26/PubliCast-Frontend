import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  Crop,
  Sliders,
  Palette,
  Smile,
  Pencil,
  Square,
  ShieldAlert,
  Maximize2,
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  Lock,
  Unlock,
  Image as ImageIcon,
} from "lucide-react"

// Filter presets
const FILTER_PRESETS = [
  { id: "default", name: "Default", class: "filter-none" },
  { id: "chrome", name: "Chrome", class: "contrast-125 saturate-150" },
  { id: "fade", name: "Fade", class: "contrast-90 brightness-110 opacity-90" },
  { id: "cold", name: "Cold", class: "hue-rotate-180 saturate-120" },
  { id: "warm", name: "Warm", class: "sepia-30 saturate-120 hue-rotate-15" },
  { id: "pastel", name: "Pastel", class: "brightness-110 saturate-75 contrast-95" },
  { id: "mono", name: "Mono", class: "grayscale contrast-125" },
  { id: "noir", name: "Noir", class: "grayscale contrast-200 brightness-90" },
  { id: "stark", name: "Stark", class: "grayscale contrast-150 brightness-105" },
  { id: "wash", name: "Wash", class: "contrast-75 brightness-125" },
  { id: "sepia", name: "Sepia", class: "sepia" },
  { id: "rust", name: "Rust", class: "sepia-75 hue-rotate-345 saturate-150" },
]

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}) {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState("SIZE") // "SIZE" | "FINETUNE" | "FILTER" | "STICKER" | "DRAW" | "FRAME" | "CENSURE" | "RESIZE"

  // SIZE tool states
  const [rotationDegree, setRotationDegree] = useState(0)
  const [sizeSubTab, setSizeSubTab] = useState("ROTATION") // "ROTATION" | "SCALE"
  const [scaleFactor, setScaleFactor] = useState(1)

  // FINETUNE tool states
  const [finetuneSubTab, setFinetuneSubTab] = useState("Brightness")
  const [finetuneValues, setFinetuneValues] = useState({
    Brightness: 0,
    Contrast: 0,
    Saturation: 0,
    Exposure: 0,
    Temperature: 0,
    Gamma: 0,
    Clarity: 0,
    Vignette: 0,
  })

  // FILTER tool states
  const [selectedFilter, setSelectedFilter] = useState("default")

  // STICKER tool states
  const [stickerSubCategory, setStickerSubCategory] = useState("Emojis") // "Select Image" | "Emojis" | "Logos"

  // DRAW tool states
  const [drawTool, setDrawTool] = useState("Sharpie") // "Sharpie" | "Eraser" | "Path" | "Line" | "Arrow" | "Rectangle" | "Ellipse" | "Text"
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [lineWidth, setLineWidth] = useState("Small")

  // FRAME tool states
  const [selectedFrame, setSelectedFrame] = useState("Polaroid")
  const [frameColor, setFrameColor] = useState("#ffffff")

  // CENSURE tool states
  const [censureMode, setCensureMode] = useState("Pixelate") // "Pixelate" | "Blur" | "Cover"
  const [censureIntensity, setCensureIntensity] = useState(50)

  // RESIZE tool states
  const [customWidth, setCustomWidth] = useState(766)
  const [customHeight, setCustomHeight] = useState(400)
  const [isAspectLocked, setIsAspectLocked] = useState(true)

  // Zoom & History
  const [zoomLevel, setZoomLevel] = useState(55)

  if (!isOpen) return null

  const handleSave = () => {
    if (onSave) {
      onSave(imageUrl)
    }
    onClose()
  }

  const sampleImage = imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"

  // Dynamic style for preview image filters & adjustments
  const previewFilterStyle = {
    filter: `
      brightness(${100 + finetuneValues.Brightness}%)
      contrast(${100 + finetuneValues.Contrast}%)
      saturate(${100 + finetuneValues.Saturation}%)
    `,
    transform: `rotate(${rotationDegree}deg) scale(${scaleFactor})`,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans select-none">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 h-[92vh] max-h-[780px] animate-scale-in">
        
        {/* TOP HEADER: Title + Close Button */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("composer.image_editor")}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1c1427] hover:bg-[#2c1d3e] text-[#facc15] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-md active:scale-95"
            title={t("composer.close")}
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* MAIN CONTENT AREA: Left Toolbar + Center Canvas Preview + Bottom Sub-controls */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT SIDEBAR TOOLBAR */}
          <div className="w-28 p-3 border-r border-slate-100 dark:border-slate-800 flex flex-col space-y-2 shrink-0 bg-slate-50/40 dark:bg-slate-900/40 overflow-y-auto">
            
            {/* History Undo button at top */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center mb-1 mx-auto transition-all cursor-pointer"
              title="History"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Tool 1: Size */}
            <button
              type="button"
              onClick={() => setActiveTool("SIZE")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "SIZE"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Crop className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_size")}</span>
            </button>

            {/* Tool 2: Finetune */}
            <button
              type="button"
              onClick={() => setActiveTool("FINETUNE")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "FINETUNE"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_finetune")}</span>
            </button>

            {/* Tool 3: Filter */}
            <button
              type="button"
              onClick={() => setActiveTool("FILTER")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "FILTER"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Palette className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_filter")}</span>
            </button>

            {/* Tool 4: Sticker */}
            <button
              type="button"
              onClick={() => setActiveTool("STICKER")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "STICKER"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Smile className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_sticker")}</span>
            </button>

            {/* Tool 5: Draw */}
            <button
              type="button"
              onClick={() => setActiveTool("DRAW")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "DRAW"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Pencil className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_draw")}</span>
            </button>

            {/* Tool 6: Frame */}
            <button
              type="button"
              onClick={() => setActiveTool("FRAME")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "FRAME"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Square className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_frame")}</span>
            </button>

            {/* Tool 7: Censure */}
            <button
              type="button"
              onClick={() => setActiveTool("CENSURE")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "CENSURE"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_censure")}</span>
            </button>

            {/* Tool 8: Resize */}
            <button
              type="button"
              onClick={() => setActiveTool("RESIZE")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "RESIZE"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_resize")}</span>
            </button>

          </div>

          {/* CENTER CANVAS & FLOATING ACTION BARS */}
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-white dark:bg-slate-900 relative overflow-hidden">
            
            {/* Top Toolbar overlay above Image */}
            <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs z-10">
              <button
                type="button"
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Redo"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-1" />

              {/* Tool specific top actions */}
              {activeTool === "SIZE" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRotationDegree((prev) => (prev - 90) % 360)}
                    className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Flip Vertical"
                  >
                    <FlipVertical className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationDegree((prev) => (prev + 90) % 360)}
                    className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Aspect Ratio"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                /* Zoom controls */
                <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.max(20, prev - 10))}
                    className="px-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span>{zoomLevel}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
                    className="px-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* IMAGE PREVIEW CANVAS WITH CROP HANDLES */}
            <div className="relative my-auto flex items-center justify-center max-w-full max-h-[380px] p-2">
              <div className="relative group rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={sampleImage}
                  alt="Editor Canvas"
                  style={previewFilterStyle}
                  className={`max-h-[340px] max-w-full object-contain transition-all duration-200 ${
                    FILTER_PRESETS.find((f) => f.id === selectedFilter)?.class || ""
                  }`}
                />

                {/* Crop Handle Corners (matches Screenshot 1) */}
                {activeTool === "SIZE" && (
                  <>
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nwse-resize shadow-md" />
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nesw-resize shadow-md" />
                    <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nesw-resize shadow-md" />
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nwse-resize shadow-md" />
                  </>
                )}

                {/* Censure Box Overlay (matches Screenshot 2) */}
                {activeTool === "CENSURE" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-16 border-2 border-rose-500/80 bg-rose-500/10 backdrop-blur-xs rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-rose-500 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded shadow-2xs">Text</span>
                    </div>
                  </div>
                )}

                {/* Floating Resize Controls Bar Overlay (matches Screenshot 3) */}
                {activeTool === "RESIZE" && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-mono font-bold z-20">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-12 bg-transparent text-center focus:outline-none"
                      />
                      <span className="text-slate-400 font-sans text-[11px]">W</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAspectLocked(!isAspectLocked)}
                      className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                      title="Aspect ratio lock"
                    >
                      {isAspectLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="w-12 bg-transparent text-center focus:outline-none"
                      />
                      <span className="text-slate-400 font-sans text-[11px]">H</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM TOOL SUB-CONTROLS PANEL (Matches Screenshots 1 to 5) */}
            <div className="w-full flex flex-col items-center justify-center space-y-3 pt-2 shrink-0">
              
              {/* SLIDER RULER TICKS (Matches Screenshot 1 & 2) */}
              {(activeTool === "SIZE" || activeTool === "FINETUNE") && (
                <div className="w-full max-w-md flex flex-col items-center space-y-1">
                  <div className="flex items-center justify-between w-full px-6 text-[10px] font-mono text-slate-400 select-none">
                    <span>-180°</span>
                    <span>-90°</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {activeTool === "SIZE" ? `${rotationDegree}°` : finetuneValues[finetuneSubTab]}
                    </span>
                    <span>+90°</span>
                    <span>+180°</span>
                  </div>
                  {/* Ticks representation line */}
                  <div className="w-full h-4 flex items-center justify-center gap-1.5 opacity-60">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all ${
                          i === 12
                            ? "w-1 h-3 bg-slate-900 dark:bg-white"
                            : i % 4 === 0
                            ? "w-0.5 h-2 bg-slate-400"
                            : "w-0.5 h-1 bg-slate-300 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TOOL SPECIFIC BOTTOM BUTTONS */}

              {/* 1. SIZE Sub-controls */}
              {activeTool === "SIZE" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSizeSubTab("ROTATION")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      sizeSubTab === "ROTATION"
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t("composer.editor_rotation")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeSubTab("SCALE")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      sizeSubTab === "SCALE"
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t("composer.editor_scale")}
                  </button>
                </div>
              )}

              {/* 2. FINETUNE Sub-controls (Matches Screenshot 2) */}
              {activeTool === "FINETUNE" && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full px-4 no-scrollbar">
                  {[
                    "Brightness",
                    "Contrast",
                    "Saturation",
                    "Exposure",
                    "Temperature",
                    "Gamma",
                    "Clarity",
                    "Vignette",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFinetuneSubTab(item)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                        finetuneSubTab === item
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {/* 3. FILTER Sub-controls (Matches Screenshot 3) */}
              {activeTool === "FILTER" && (
                <div className="flex items-center gap-3 overflow-x-auto max-w-full px-4 py-1 no-scrollbar">
                  {FILTER_PRESETS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex flex-col items-center gap-1 shrink-0 cursor-pointer group ${
                        selectedFilter === filter.id ? "scale-105" : ""
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shadow-xs ${
                          selectedFilter === filter.id
                            ? "border-indigo-600 ring-2 ring-indigo-500/30"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <img
                          src={sampleImage}
                          alt={filter.name}
                          className={`w-full h-full object-cover ${filter.class}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {filter.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. STICKER Sub-controls (Matches Screenshot 4) */}
              {activeTool === "STICKER" && (
                <div className="space-y-3 w-full flex flex-col items-center">
                  {/* Emoji List Carousel */}
                  <div className="flex items-center gap-3 overflow-x-auto max-w-full px-4 no-scrollbar">
                    {["😂", "❤️", "🥳", "😭", "🙏", "😍", "🥰", "🍆", "💩", "😈", "⭐", "😋", "👍"].map(
                      (em, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-xl flex items-center justify-center hover:scale-125 transition-transform cursor-pointer shrink-0"
                        >
                          {em}
                        </button>
                      )
                    )}
                  </div>

                  {/* Sub category pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStickerSubCategory("Select Image")}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer border ${
                        stickerSubCategory === "Select Image"
                          ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t("composer.editor_select_image")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStickerSubCategory("Emojis")}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer border ${
                        stickerSubCategory === "Emojis"
                          ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t("composer.editor_emojis")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStickerSubCategory("Logos")}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer border ${
                        stickerSubCategory === "Logos"
                          ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t("composer.editor_logos")}
                    </button>
                  </div>
                </div>
              )}

              {/* 5. DRAW Sub-controls (Matches Screenshot 5) */}
              {activeTool === "DRAW" && (
                <div className="flex flex-col items-center space-y-3 w-full">
                  {/* Upper row: Color circle target + Line width dropdown */}
                  <div className="flex items-center gap-8 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-normal">color</span>
                      <button
                        type="button"
                        className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center p-0.5 cursor-pointer hover:scale-110 transition-transform shadow-xs"
                      >
                        <div className="w-full h-full rounded-full bg-red-500" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-normal">line width</span>
                      <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none cursor-pointer shadow-2xs"
                      >
                        <option value="Small">Small ▾</option>
                        <option value="Medium">Medium ▾</option>
                        <option value="Large">Large ▾</option>
                      </select>
                    </div>
                  </div>

                  {/* Bottom row: Tool selector pills strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-4 no-scrollbar text-xs font-bold text-slate-700 dark:text-slate-300">
                    {[
                      { id: "Sharpie", name: "Sharpie", icon: "✳" },
                      { id: "Eraser", name: "Eraser", icon: "✎" },
                      { id: "Path", name: "Path", icon: "∿" },
                      { id: "Line", name: "Line", icon: "╱" },
                      { id: "Arrow", name: "Arrow", icon: "↗" },
                      { id: "Rectangle", name: "Rectangle", icon: "▢" },
                      { id: "Ellipse", name: "Ellipse", icon: "◯" },
                      { id: "Text", name: "Text", icon: "t" },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setDrawTool(tool.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          drawTool === tool.id
                            ? "bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-xs font-serif">{tool.icon}</span>
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. FRAME Sub-controls (Matches Screenshot 1) */}
              {activeTool === "FRAME" && (
                <div className="space-y-3 w-full flex flex-col items-center">
                  {/* Color Picker label & circle */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">color</span>
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 cursor-pointer bg-white"
                    />
                  </div>

                  {/* Frame preset tiles row */}
                  <div className="flex items-center gap-2.5 overflow-x-auto max-w-full px-4 py-1 no-scrollbar">
                    {[
                      { id: "None", label: "None", borderStyle: "border-dashed border-slate-300 dark:border-slate-700" },
                      { id: "Mat", label: "Mat", borderStyle: "border-4 border-slate-800 dark:border-slate-200" },
                      { id: "Bevel", label: "Bevel", borderStyle: "border-2 border-slate-700 outline outline-1 outline-slate-400" },
                      { id: "Line", label: "Line", borderStyle: "border border-slate-800 dark:border-slate-200" },
                      { id: "Zebra", label: "Zebra", borderStyle: "border-2 border-dashed border-slate-800" },
                      { id: "Lumber", label: "Lumber", borderStyle: "border-2 border-slate-700" },
                      { id: "Inset", label: "Inset", borderStyle: "border border-slate-600 shadow-inner" },
                      { id: "Plus", label: "Plus", borderStyle: "border border-slate-400" },
                      { id: "Hook", label: "Hook", borderStyle: "border-t-2 border-b-2 border-slate-700" },
                      { id: "Polaroid", label: "Polaroid", borderStyle: "border-1 border-slate-300 pb-4 bg-white dark:bg-slate-800" },
                    ].map((frame) => {
                      const isSelected = selectedFrame === frame.id
                      return (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => setSelectedFrame(frame.id)}
                          className={`w-14 h-16 rounded-lg flex items-center justify-center p-1 transition-all cursor-pointer bg-white dark:bg-slate-900 border-2 ${
                            isSelected
                              ? "border-[#facc15] shadow-md ring-1 ring-[#facc15]/50 scale-105"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-full h-full flex items-center justify-center rounded-xs ${frame.borderStyle}`}>
                            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              {frame.label}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 7. CENSURE Sub-controls (Matches Screenshot 2) */}
              {activeTool === "CENSURE" && (
                <div className="flex items-center gap-3">
                  {["Pixelate", "Blur", "Cover"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCensureMode(mode)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                        censureMode === mode
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}

              {/* 8. RESIZE Sub-controls (Matches Screenshot 3) */}
              {activeTool === "RESIZE" && (
                <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>Width:</span>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-mono"
                    />
                    <span>px</span>
                  </div>
                  <span>×</span>
                  <div className="flex items-center gap-2">
                    <span>Height:</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-mono"
                    />
                    <span>px</span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Right Resolution Display */}
            <div className="absolute bottom-3 right-6 text-[10px] font-mono text-slate-400">
              {customWidth} × {customHeight}
            </div>

          </div>

        </div>

        {/* BOTTOM FOOTER ACTIONS */}
        <div className="px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t("composer.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-black bg-[#24172b] hover:bg-[#34223f] text-[#facc15] shadow-md transition-all cursor-pointer active:scale-95"
          >
            {t("composer.editor_save")}
          </button>
        </div>

      </div>
    </div>
  )
}
