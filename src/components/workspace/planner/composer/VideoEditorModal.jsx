import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  Crop as CropIcon,
  Maximize2,
  Sliders,
  Palette,
  Smile,
  Pencil,
  ShieldAlert,
  X,
  RotateCcw,
  Undo2,
  Redo2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  FlipHorizontal,
  FlipVertical,
  Square,
  Lock,
  Unlock,
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

export default function VideoEditorModal({
  isOpen,
  onClose,
  videoUrl,
  onSave,
}) {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState("CROP") // "CROP" | "SIZE" | "FINETUNE" | "FILTER" | "STICKER" | "DRAW" | "RESIZE"

  // Audio state
  const [saveAudio, setSaveAudio] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // CROP & Timeline state
  const [currentTime, setCurrentTime] = useState("0:17")
  const videoRef = useRef(null)

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
  const [stickerSubCategory, setStickerSubCategory] = useState("Emojis")

  // DRAW tool states
  const [drawTool, setDrawTool] = useState("Sharpie")
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [lineWidth, setLineWidth] = useState("Small")

  // RESIZE tool states
  const [customWidth, setCustomWidth] = useState(576)
  const [customHeight, setCustomHeight] = useState(1024)
  const [isAspectLocked, setIsAspectLocked] = useState(true)

  // Zoom
  const [zoomLevel, setZoomLevel] = useState(26)

  if (!isOpen) return null

  const handleSave = () => {
    if (onSave) {
      onSave(videoUrl)
    }
    onClose()
  }

  const sampleVideo = videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4"

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

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
            {t("composer.video_editor")}
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

            {/* Tool 1: Crop */}
            <button
              type="button"
              onClick={() => setActiveTool("CROP")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "CROP"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <CropIcon className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.crop")}</span>
            </button>

            {/* Tool 2: Size */}
            <button
              type="button"
              onClick={() => setActiveTool("SIZE")}
              className={`w-full py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                activeTool === "SIZE"
                  ? "bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="text-[11px]">{t("composer.editor_size")}</span>
            </button>

            {/* Tool 3: Finetune */}
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

            {/* Tool 4: Filter */}
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

            {/* Tool 5: Sticker */}
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

            {/* Tool 6: Draw */}
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

            {/* Tool 7: Resize */}
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
            
            {/* TOP ACTION BAR OVERLAY: Undo, Redo, Zoom, Save audio [On|Off] */}
            <div className="flex items-center gap-3 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs z-10">
              <button
                type="button"
                className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Redo"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-0.5" />

              {/* Zoom controls */}
              <div className="flex items-center gap-1 px-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(10, prev - 5))}
                  className="px-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  -
                </button>
                <span>{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(100, prev + 5))}
                  className="px-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  +
                </button>
              </div>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-0.5" />

              {/* Save audio [ On | Off ] toggle pill (Matches Screenshots 1 to 5) */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("composer.save_audio")}</span>
                <div className="flex items-center bg-slate-200 dark:bg-slate-900 p-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSaveAudio(true)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                      saveAudio
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveAudio(false)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                      !saveAudio
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>

            {/* VIDEO PREVIEW CANVAS WITH FLOATING PLAYER CONTROLS */}
            <div className="relative my-auto flex items-center justify-center max-w-full max-h-[360px] p-2">
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black max-h-[320px] aspect-[9/16]">
                <video
                  ref={videoRef}
                  src={sampleVideo}
                  style={previewFilterStyle}
                  className={`w-full h-full object-cover transition-all duration-200 ${
                    FILTER_PRESETS.find((f) => f.id === selectedFilter)?.class || ""
                  }`}
                  loop
                  playsInline
                />

                {/* Corner Crop Handles for SIZE Tool (Matches Screenshot 2) */}
                {activeTool === "SIZE" && (
                  <>
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nwse-resize shadow-md z-20" />
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nesw-resize shadow-md z-20" />
                    <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nesw-resize shadow-md z-20" />
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-slate-900 ring-2 ring-white cursor-nwse-resize shadow-md z-20" />
                  </>
                )}

                {/* Floating Video Controls Pill (Matches Screenshot 1 - Play, Mute, Split) */}
                {activeTool === "CROP" && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 z-20">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-white transition-transform cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-white transition-transform cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-black text-slate-900 dark:text-white cursor-pointer transition-colors"
                    >
                      <Scissors className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>{t("composer.split")}</span>
                    </button>
                  </div>
                )}

                {/* RESIZE Floating Overlay Pill on Canvas (Matches Screenshot 2) */}
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
                      className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
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

            {/* BOTTOM SUB-CONTROLS PANEL (Matches Screenshots 1 to 5) */}
            <div className="w-full flex flex-col items-center justify-center space-y-3 pt-1 shrink-0">
              
              {/* 1. CROP VIDEO TIMELINE TRACKER (Matches Screenshot 1) */}
              {activeTool === "CROP" && (
                <div className="w-full max-w-xl flex flex-col items-center space-y-1">
                  {/* Timestamp ruler marks */}
                  <div className="flex items-center justify-between w-full px-2 text-[10px] font-mono text-slate-400 select-none">
                    <span>0:00</span>
                    <span className="font-extrabold text-slate-900 dark:text-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded-md shadow-xs">
                      {currentTime}
                    </span>
                    <span>0:27</span>
                  </div>

                  {/* Filmstrip Frame Timeline Track with Yellow Handles & Blue Scrubber */}
                  <div className="relative w-full h-12 bg-slate-900 rounded-xl overflow-hidden border-2 border-amber-400 p-0.5 flex items-center shadow-md">
                    {/* Keyframe thumbnails strip */}
                    <div className="w-full h-full flex items-center gap-0.5 overflow-hidden opacity-90">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="h-full flex-1 bg-indigo-900/60 overflow-hidden shrink-0 border-r border-slate-800">
                          <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=60"
                            alt="thumb"
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Scrubber Playhead line (Matches Screenshot 1 blue line) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-500 shadow-md flex items-center justify-center z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white shadow-xs" />
                    </div>

                    {/* Left Trim Handle */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-amber-400 rounded-l-lg flex items-center justify-center cursor-ew-resize">
                      <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                    </div>

                    {/* Right Trim Handle */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-amber-400 rounded-r-lg flex items-center justify-center cursor-ew-resize">
                      <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDER RULER TICKS (Matches Screenshot 2 & 3) */}
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

              {/* 2. SIZE Sub-controls */}
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

              {/* 3. FINETUNE Sub-controls */}
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

              {/* 4. FILTER Sub-controls */}
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
                          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=60"
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

              {/* 5. STICKER Sub-controls */}
              {activeTool === "STICKER" && (
                <div className="space-y-3 w-full flex flex-col items-center">
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

              {/* 6. DRAW Sub-controls (Matches Screenshot 1) */}
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

              {/* 6. RESIZE Sub-controls */}
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

            {/* Bottom Right Resolution Display (Matches Screenshot 2: 576 × 1024) */}
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
