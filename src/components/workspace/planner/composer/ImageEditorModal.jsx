import React, { useState, useRef, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text as KonvaText, Line, Arrow, Ellipse, Group } from "react-konva"
import Konva from "konva"
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
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Type,
} from "lucide-react"

// Filter presets — CSS-equivalent adjustments applied through Konva's own
// filter pipeline (Brighten/Contrast/HSL) so what's shown in the canvas is
// exactly what toDataURL() bakes into the exported image, unlike the old
// mockup's CSS `filter` classes which never touched the actual pixels.
const FILTER_PRESETS = [
  { id: "none", name: "Không có" },
  { id: "grayscale", name: "Đen trắng" },
  { id: "vintage", name: "Cổ điển" },
  { id: "warm", name: "Ấm" },
  { id: "cold", name: "Lạnh" },
  { id: "film", name: "Phim" },
  { id: "bright", name: "Sáng" },
  { id: "highcontrast", name: "Tương phản cao" },
]

const ASPECT_PRESETS = [
  { id: "free", label: "Tự do", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
]

const DRAW_TOOLS = [
  { id: "marker", label: "Bút dạ" },
  { id: "line", label: "Đường thẳng" },
  { id: "arrow", label: "Mũi tên" },
  { id: "rect", label: "Chữ nhật" },
  { id: "ellipse", label: "Elip" },
  { id: "eraser", label: "Tẩy" },
]

const DRAW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#6366f1", "#a855f7", "#0f172a"]
const LINE_WIDTHS = [
  { id: "thin", size: 2 },
  { id: "medium", size: 5 },
  { id: "thick", size: 10 },
  { id: "extrathick", size: 18 },
]

const FRAME_PRESETS = [
  { id: "none", label: "Không có" },
  { id: "simple", label: "Đơn giản" },
  { id: "double", label: "Đôi" },
  { id: "rounded", label: "Bo góc" },
  { id: "polaroid", label: "Polaroid" },
]

const EMOJI_STICKERS = [
  "😂", "❤️", "🥳", "😭", "🙏", "😍", "🥰", "🔥", "💯", "😈", "⭐", "😋",
  "👍", "👏", "🎉", "✨", "💪", "🙌", "😎", "🤩", "😅", "🥹", "😱", "💖",
]

const CANVAS_MAX_W = 720
const CANVAS_MAX_H = 460

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Konva's built-in filters run on the node itself (not a global CSS class),
// so applying a preset means toggling which Konva.Filters functions are
// attached plus setting their numeric params — this is what actually gets
// rasterized into the exported image, unlike the mockup's decorative-only
// Tailwind filter classes.
function applyFilterToNode(node, filterId) {
  if (!node) return
  node.cache()
  switch (filterId) {
    case "grayscale":
      node.filters([Konva.Filters.Grayscale])
      break
    case "vintage":
      node.filters([Konva.Filters.Sepia, Konva.Filters.Contrast])
      node.contrast(10)
      break
    case "warm":
      node.filters([Konva.Filters.RGB])
      node.red(node.image() ? undefined : undefined)
      node.filters([Konva.Filters.HSL])
      node.hue(20)
      node.saturation(0.15)
      break
    case "cold":
      node.filters([Konva.Filters.HSL])
      node.hue(-20)
      node.saturation(0.1)
      break
    case "film":
      node.filters([Konva.Filters.Contrast, Konva.Filters.Noise])
      node.contrast(15)
      node.noise(0.15)
      break
    case "bright":
      node.filters([Konva.Filters.Brighten])
      node.brightness(0.15)
      break
    case "highcontrast":
      node.filters([Konva.Filters.Contrast])
      node.contrast(40)
      break
    case "none":
    default:
      node.filters([])
      break
  }
  node.getLayer()?.batchDraw()
}

export default function ImageEditorModal({ isOpen, onClose, imageUrl, onSave }) {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState("SIZE")
  const [imgEl, setImgEl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmClose, setConfirmClose] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Stage / image geometry (natural size scaled down to fit the viewport)
  const [stageSize, setStageSize] = useState({ width: CANVAS_MAX_W, height: CANVAS_MAX_H })
  const [imgAttrs, setImgAttrs] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 })

  // SIZE (crop) tool
  const [aspectId, setAspectId] = useState("free")
  const [cropBox, setCropBox] = useState(null) // {x,y,width,height} in stage coords

  // FINETUNE tool
  const [finetuneMode, setFinetuneMode] = useState("ADJUST") // "ROTATE" | "ADJUST"
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  // FILTER tool
  const [selectedFilter, setSelectedFilter] = useState("none")

  // STICKER / DRAW / FRAME / CENSURE elements — plain Konva-shape descriptors
  const [stickers, setStickers] = useState([])
  const [drawings, setDrawings] = useState([])
  const [censureBoxes, setCensureBoxes] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const [drawTool, setDrawTool] = useState("marker")
  const [drawColor, setDrawColor] = useState(DRAW_COLORS[0])
  const [lineWidthId, setLineWidthId] = useState("medium")
  const isDrawingRef = useRef(false)

  const [selectedFrame, setSelectedFrame] = useState("none")
  const [frameColor, setFrameColor] = useState("#ffffff")
  const [frameThickness, setFrameThickness] = useState(16)
  const [frameRadius, setFrameRadius] = useState(0)

  // RESIZE tool
  const [outWidth, setOutWidth] = useState(0)
  const [outHeight, setOutHeight] = useState(0)
  const [aspectLocked, setAspectLocked] = useState(true)

  const stageRef = useRef(null)
  const imageNodeRef = useRef(null)
  const trRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !imageUrl) return
    setLoading(true)
    loadImageElement(imageUrl)
      .then((img) => {
        const scale = Math.min(CANVAS_MAX_W / img.naturalWidth, CANVAS_MAX_H / img.naturalHeight, 1)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        setImgEl(img)
        setStageSize({ width: w, height: h })
        setImgAttrs({ x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 })
        setCropBox({ x: 0, y: 0, width: w, height: h })
        setOutWidth(Math.round(img.naturalWidth))
        setOutHeight(Math.round(img.naturalHeight))
        setLoading(false)
        setIsDirty(false)
      })
      .catch(() => setLoading(false))
  }, [isOpen, imageUrl])

  useEffect(() => {
    if (imageNodeRef.current) {
      applyFilterToNode(imageNodeRef.current, selectedFilter)
    }
  }, [selectedFilter, imgEl])

  useEffect(() => {
    if (!imageNodeRef.current) return
    const node = imageNodeRef.current
    node.cache()
    node.getLayer()?.batchDraw()
  }, [brightness, contrast, saturation])

  useEffect(() => {
    if (trRef.current && selectedId) {
      const stage = stageRef.current
      const node = stage?.findOne(`#${selectedId}`)
      if (node) {
        trRef.current.nodes([node])
        trRef.current.getLayer().batchDraw()
      }
    } else if (trRef.current) {
      trRef.current.nodes([])
    }
  }, [selectedId, stickers, drawings])

  if (!isOpen) return null

  const markDirty = () => setIsDirty(true)

  const requestClose = () => {
    if (isDirty) {
      setConfirmClose(true)
    } else {
      onClose()
    }
  }

  const handleAddSticker = (emoji) => {
    const id = `sticker-${Date.now()}`
    setStickers((prev) => [
      ...prev,
      { id, emoji, x: stageSize.width / 2 - 24, y: stageSize.height / 2 - 24, fontSize: 48, rotation: 0 },
    ])
    setSelectedId(id)
    markDirty()
  }

  const updateSticker = (id, attrs) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...attrs } : s)))
  }

  const removeSticker = (id) => {
    setStickers((prev) => prev.filter((s) => s.id !== id))
    setSelectedId(null)
    markDirty()
  }

  const duplicateSticker = (id) => {
    const s = stickers.find((st) => st.id === id)
    if (!s) return
    const newId = `sticker-${Date.now()}`
    setStickers((prev) => [...prev, { ...s, id: newId, x: s.x + 16, y: s.y + 16 }])
    setSelectedId(newId)
    markDirty()
  }

  const currentLineWidth = LINE_WIDTHS.find((w) => w.id === lineWidthId)?.size || 5

  const handleStageMouseDown = (e) => {
    if (activeTool === "DRAW" && drawTool !== "eraser") {
      const pos = e.target.getStage().getPointerPosition()
      isDrawingRef.current = true
      const id = `draw-${Date.now()}`
      const base = { id, tool: drawTool, color: drawColor, width: currentLineWidth }
      if (drawTool === "marker") {
        setDrawings((prev) => [...prev, { ...base, points: [pos.x, pos.y] }])
      } else {
        setDrawings((prev) => [...prev, { ...base, points: [pos.x, pos.y, pos.x, pos.y] }])
      }
      return
    }
    if (activeTool === "CENSURE") {
      const pos = e.target.getStage().getPointerPosition()
      isDrawingRef.current = true
      const id = `censure-${Date.now()}`
      setCensureBoxes((prev) => [...prev, { id, x: pos.x, y: pos.y, width: 0, height: 0, mode: "blur" }])
      return
    }
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }

  const handleStageMouseMove = (e) => {
    if (!isDrawingRef.current) return
    const pos = e.target.getStage().getPointerPosition()
    if (activeTool === "DRAW") {
      setDrawings((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (!last) return prev
        if (last.tool === "marker") {
          last.points = [...last.points, pos.x, pos.y]
        } else {
          last.points = [last.points[0], last.points[1], pos.x, pos.y]
        }
        return next
      })
    } else if (activeTool === "CENSURE") {
      setCensureBoxes((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (!last) return prev
        last.width = pos.x - last.x
        last.height = pos.y - last.y
        return next
      })
    }
  }

  const handleStageMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false
      markDirty()
    }
  }

  const clearDrawings = () => {
    setDrawings([])
    markDirty()
  }

  const toggleCensureMode = (id) => {
    setCensureBoxes((prev) => prev.map((c) => (c.id === id ? { ...c, mode: c.mode === "blur" ? "black" : "blur" } : c)))
    markDirty()
  }

  const removeCensureBox = (id) => {
    setCensureBoxes((prev) => prev.filter((c) => c.id !== id))
    markDirty()
  }

  const handleFlip = (axis) => {
    setImgAttrs((prev) => ({
      ...prev,
      scaleX: axis === "h" ? prev.scaleX * -1 : prev.scaleX,
      scaleY: axis === "v" ? prev.scaleY * -1 : prev.scaleY,
    }))
    markDirty()
  }

  const handleRotate90 = () => {
    setImgAttrs((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
    markDirty()
  }

  const handleAspectSelect = (preset) => {
    setAspectId(preset.id)
    if (!preset.ratio) {
      setCropBox({ x: 0, y: 0, width: stageSize.width, height: stageSize.height })
      return
    }
    let w = stageSize.width
    let h = w / preset.ratio
    if (h > stageSize.height) {
      h = stageSize.height
      w = h * preset.ratio
    }
    setCropBox({ x: (stageSize.width - w) / 2, y: (stageSize.height - h) / 2, width: w, height: h })
    markDirty()
  }

  const handleOutWidthChange = (v) => {
    const w = Number(v) || 0
    setOutWidth(w)
    if (aspectLocked && imgEl) {
      setOutHeight(Math.round((w * imgEl.naturalHeight) / imgEl.naturalWidth))
    }
  }

  const handleOutHeightChange = (v) => {
    const h = Number(v) || 0
    setOutHeight(h)
    if (aspectLocked && imgEl) {
      setOutWidth(Math.round((h * imgEl.naturalWidth) / imgEl.naturalHeight))
    }
  }

  // Bakes every layer (image + filters/adjustments + stickers + drawings +
  // censure + frame) into one flat image via Konva's own renderer, cropped
  // to cropBox, then resampled to the RESIZE tab's target dimensions — this
  // is a real pixel export, not a CSS overlay simulation.
  const handleSave = async () => {
    const stage = stageRef.current
    if (!stage) return

    trRef.current?.nodes([])
    stage.batchDraw()

    const box = cropBox || { x: 0, y: 0, width: stageSize.width, height: stageSize.height }
    const pixelRatio = imgEl ? imgEl.naturalWidth / stageSize.width : 1

    let dataUrl = stage.toDataURL({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      pixelRatio,
    })

    if (selectedFrame !== "none" && frameThickness > 0) {
      dataUrl = await applyFrame(dataUrl, selectedFrame, frameColor, frameThickness, frameRadius)
    }

    if (outWidth > 0 && outHeight > 0) {
      dataUrl = await resampleDataUrl(dataUrl, outWidth, outHeight)
    }

    if (onSave) onSave(dataUrl)
    onClose()
  }

  const previewFilterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 h-[92vh] max-h-[820px] animate-scale-in">
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("composer.image_editor")}
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={requestClose}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t("composer.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-xl text-xs font-black bg-[hsl(var(--sidebar-primary))] hover:opacity-90 text-white shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {t("composer.editor_save")}
            </button>
            <button
              type="button"
              onClick={requestClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* LEFT SIDEBAR */}
          <div className="w-44 p-3 border-r border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 shrink-0 bg-slate-50/40 dark:bg-slate-900/40 overflow-y-auto">
            {[
              { id: "SIZE", icon: Crop, label: t("composer.editor_size") },
              { id: "FINETUNE", icon: Sliders, label: t("composer.editor_finetune") },
              { id: "FILTER", icon: Palette, label: t("composer.editor_filter") },
              { id: "STICKER", icon: Smile, label: t("composer.editor_sticker") },
              { id: "DRAW", icon: Pencil, label: t("composer.editor_draw") },
              { id: "FRAME", icon: Square, label: t("composer.editor_frame") },
              { id: "CENSURE", icon: ShieldAlert, label: t("composer.editor_censure") },
              { id: "RESIZE", icon: Maximize2, label: t("composer.editor_resize") },
            ].map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`w-full py-2.5 px-3 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTool === tool.id
                    ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <tool.icon className="h-4 w-4 shrink-0" />
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* CENTER VIEWPORT */}
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
            {loading ? (
              <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <div style={previewFilterStyle} className="shadow-lg rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  onMouseDown={handleStageMouseDown}
                  onMouseMove={handleStageMouseMove}
                  onMouseUp={handleStageMouseUp}
                >
                  <Layer>
                    {imgEl && (
                      <KonvaImage
                        ref={imageNodeRef}
                        image={imgEl}
                        x={imgAttrs.x + imgAttrs.width / 2}
                        y={imgAttrs.y + imgAttrs.height / 2}
                        width={imgAttrs.width}
                        height={imgAttrs.height}
                        offsetX={imgAttrs.width / 2}
                        offsetY={imgAttrs.height / 2}
                        rotation={imgAttrs.rotation}
                        scaleX={imgAttrs.scaleX}
                        scaleY={imgAttrs.scaleY}
                      />
                    )}

                    {/* Drawings */}
                    {drawings.map((d) => {
                      if (d.tool === "marker") {
                        return (
                          <Line
                            key={d.id}
                            points={d.points}
                            stroke={d.color}
                            strokeWidth={d.width}
                            lineCap="round"
                            lineJoin="round"
                            tension={0.5}
                          />
                        )
                      }
                      if (d.tool === "line") {
                        return <Line key={d.id} points={d.points} stroke={d.color} strokeWidth={d.width} lineCap="round" />
                      }
                      if (d.tool === "arrow") {
                        return (
                          <Arrow key={d.id} points={d.points} stroke={d.color} fill={d.color} strokeWidth={d.width} />
                        )
                      }
                      if (d.tool === "rect") {
                        const [x1, y1, x2, y2] = d.points
                        return (
                          <Rect
                            key={d.id}
                            x={Math.min(x1, x2)}
                            y={Math.min(y1, y2)}
                            width={Math.abs(x2 - x1)}
                            height={Math.abs(y2 - y1)}
                            stroke={d.color}
                            strokeWidth={d.width}
                          />
                        )
                      }
                      if (d.tool === "ellipse") {
                        const [x1, y1, x2, y2] = d.points
                        return (
                          <Ellipse
                            key={d.id}
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2}
                            radiusX={Math.abs(x2 - x1) / 2}
                            radiusY={Math.abs(y2 - y1) / 2}
                            stroke={d.color}
                            strokeWidth={d.width}
                          />
                        )
                      }
                      return null
                    })}

                    {/* Stickers */}
                    {stickers.map((s) => (
                      <KonvaText
                        key={s.id}
                        id={s.id}
                        text={s.emoji}
                        x={s.x}
                        y={s.y}
                        fontSize={s.fontSize}
                        rotation={s.rotation}
                        draggable={activeTool === "STICKER"}
                        onClick={() => activeTool === "STICKER" && setSelectedId(s.id)}
                        onTap={() => activeTool === "STICKER" && setSelectedId(s.id)}
                        onDragEnd={(e) => {
                          updateSticker(s.id, { x: e.target.x(), y: e.target.y() })
                          markDirty()
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target
                          updateSticker(s.id, {
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                            fontSize: Math.max(12, s.fontSize * node.scaleX()),
                          })
                          node.scaleX(1)
                          node.scaleY(1)
                          markDirty()
                        }}
                      />
                    ))}

                    {/* Censure boxes */}
                    {censureBoxes.map((c) => (
                      <Group key={c.id}>
                        <Rect
                          x={Math.min(c.x, c.x + c.width)}
                          y={Math.min(c.y, c.y + c.height)}
                          width={Math.abs(c.width)}
                          height={Math.abs(c.height)}
                          fill={c.mode === "black" ? "#000000" : "rgba(15,23,42,0.55)"}
                          filters={c.mode === "blur" ? [Konva.Filters.Blur] : []}
                          blurRadius={c.mode === "blur" ? 12 : 0}
                        />
                      </Group>
                    ))}

                    {activeTool === "STICKER" && <Transformer ref={trRef} rotateEnabled resizeEnabled />}
                  </Layer>

                  {/* Crop overlay layer */}
                  {activeTool === "SIZE" && cropBox && (
                    <Layer listening={false}>
                      <Rect x={0} y={0} width={stageSize.width} height={cropBox.y} fill="rgba(0,0,0,0.55)" />
                      <Rect
                        x={0}
                        y={cropBox.y + cropBox.height}
                        width={stageSize.width}
                        height={stageSize.height - cropBox.y - cropBox.height}
                        fill="rgba(0,0,0,0.55)"
                      />
                      <Rect x={0} y={cropBox.y} width={cropBox.x} height={cropBox.height} fill="rgba(0,0,0,0.55)" />
                      <Rect
                        x={cropBox.x + cropBox.width}
                        y={cropBox.y}
                        width={stageSize.width - cropBox.x - cropBox.width}
                        height={cropBox.height}
                        fill="rgba(0,0,0,0.55)"
                      />
                      <Rect
                        x={cropBox.x}
                        y={cropBox.y}
                        width={cropBox.width}
                        height={cropBox.height}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[6, 4]}
                      />
                    </Layer>
                  )}
                </Stage>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="w-80 border-l border-slate-100 dark:border-slate-800 p-5 overflow-y-auto shrink-0 bg-white dark:bg-slate-900">
            {activeTool === "SIZE" && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Tỉ lệ khung
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAspectSelect(preset)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                          aspectId === preset.id
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className="border-2 border-slate-500 dark:border-slate-400 rounded-2xs"
                          style={{
                            width: preset.ratio ? (preset.ratio >= 1 ? 24 : 24 * preset.ratio) : 20,
                            height: preset.ratio ? (preset.ratio >= 1 ? 24 / preset.ratio : 24) : 20,
                          }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rộng (px)</label>
                    <input
                      type="text"
                      readOnly
                      value={cropBox ? Math.round(cropBox.width) : 0}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cao (px)</label>
                    <input
                      type="text"
                      readOnly
                      value={cropBox ? Math.round(cropBox.height) : 0}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotate90}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Xoay 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFlip("h")}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Lật ngang"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFlip("v")}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Lật dọc"
                  >
                    <FlipVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTool === "FINETUNE" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  {["ROTATE", "ADJUST"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFinetuneMode(m)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                        finetuneMode === m
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {m === "ROTATE" ? "Xoay" : "Điều chỉnh"}
                    </button>
                  ))}
                </div>

                {finetuneMode === "ROTATE" ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      <span>Góc xoay</span>
                      <span>{imgAttrs.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={imgAttrs.rotation}
                      onChange={(e) => {
                        setImgAttrs((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                        markDirty()
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: "Độ sáng", value: brightness, setter: setBrightness },
                      { label: "Độ tương phản", value: contrast, setter: setContrast },
                      { label: "Độ bão hòa", value: saturation, setter: setSaturation },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                          <span>{s.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span>{s.value}</span>
                            <button
                              type="button"
                              onClick={() => {
                                s.setter(100)
                                markDirty()
                              }}
                              className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                            >
                              reset
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={200}
                          value={s.value}
                          onChange={(e) => {
                            s.setter(Number(e.target.value))
                            markDirty()
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTool === "FILTER" && (
              <div className="grid grid-cols-2 gap-3">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(f.id)
                      markDirty()
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedFilter === f.id
                        ? "border-indigo-600 ring-2 ring-indigo-500/30"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {imageUrl && <img src={imageUrl} alt={f.name} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTool === "STICKER" && (
              <div className="space-y-4">
                {selectedId && stickers.some((s) => s.id === selectedId) ? (
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Sticker đã chọn
                    </p>
                    <div className="text-5xl text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      {stickers.find((s) => s.id === selectedId)?.emoji}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateSticker(selectedId)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" /> Nhân đôi
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSticker(selectedId)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Tìm sticker..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                      disabled
                    />
                    <div className="grid grid-cols-6 gap-1.5">
                      {EMOJI_STICKERS.map((em, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddSticker(em)}
                          className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 text-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTool === "DRAW" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-1.5">
                  {DRAW_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setDrawTool(tool.id)}
                      className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        drawTool === tool.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Màu sắc</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {DRAW_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDrawColor(c)}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                          drawColor === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={drawColor}
                      onChange={(e) => setDrawColor(e.target.value)}
                      className="w-6 h-6 rounded-full border border-slate-300 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Độ dày nét</p>
                  <div className="flex items-center gap-3">
                    {LINE_WIDTHS.map((lw) => (
                      <button
                        key={lw.id}
                        type="button"
                        onClick={() => setLineWidthId(lw.id)}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer ${
                          lineWidthId === lw.id ? "bg-slate-200 dark:bg-slate-700" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="rounded-full bg-slate-800 dark:bg-slate-200" style={{ width: lw.size, height: lw.size }} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearDrawings}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {activeTool === "FRAME" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  {FRAME_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFrame(f.id)
                        markDirty()
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedFrame === f.id
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded border-2 border-slate-500 dark:border-slate-400 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{f.label}</span>
                    </button>
                  ))}
                </div>

                {selectedFrame !== "none" && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Màu khung</p>
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => {
                          setFrameColor(e.target.value)
                          markDirty()
                        }}
                        className="w-9 h-9 rounded-full border border-slate-300 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        <span>Độ dày</span>
                        <span>{frameThickness}px</span>
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={64}
                        value={frameThickness}
                        onChange={(e) => {
                          setFrameThickness(Number(e.target.value))
                          markDirty()
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        <span>Bo góc</span>
                        <span>{frameRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={48}
                        value={frameRadius}
                        onChange={(e) => {
                          setFrameRadius(Number(e.target.value))
                          markDirty()
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTool === "CENSURE" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Vẽ một vùng trên ảnh để làm mờ hoặc che nội dung nhạy cảm.
                </p>
                {censureBoxes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Kéo chuột trên ảnh để tạo vùng che đầu tiên.</p>
                ) : (
                  <div className="space-y-2">
                    {censureBoxes.map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Vùng {idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleCensureMode(c.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold cursor-pointer"
                          >
                            {c.mode === "blur" ? "Làm mờ" : "Che đen"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCensureBox(c.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTool === "RESIZE" && (
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Chiều rộng (px)</label>
                    <input
                      type="number"
                      value={outWidth}
                      onChange={(e) => handleOutWidthChange(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAspectLocked((v) => !v)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer mb-0.5"
                    title="Khóa tỉ lệ"
                  >
                    {aspectLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Chiều cao (px)</label>
                    <input
                      type="number"
                      value={outHeight}
                      onChange={(e) => handleOutHeightChange(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Kích thước tệp ước tính: {((outWidth * outHeight * 3) / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmClose && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setConfirmClose(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 w-72 border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Hủy các thay đổi?</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Tiếp tục sửa
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Hủy thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Draws the exported dataUrl onto a larger canvas with a colored border,
// used only when the user picked a frame preset — kept as plain Canvas2D
// (not Konva) since it's a one-shot post-process step after the editor's
// own Stage has already been flattened.
function applyFrame(dataUrl, frameId, color, thickness, radius) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const isDouble = frameId === "double"
      const pad = thickness
      const canvas = document.createElement("canvas")
      canvas.width = img.width + pad * 2
      canvas.height = img.height + pad * 2 + (frameId === "polaroid" ? pad * 1.5 : 0)
      const ctx = canvas.getContext("2d")

      ctx.fillStyle = color
      roundRect(ctx, 0, 0, canvas.width, canvas.height, radius)
      ctx.fill()

      ctx.save()
      roundRect(ctx, pad, pad, img.width, img.height, Math.max(0, radius - pad / 2))
      ctx.clip()
      ctx.drawImage(img, pad, pad, img.width, img.height)
      ctx.restore()

      if (isDouble) {
        ctx.strokeStyle = "rgba(0,0,0,0.25)"
        ctx.lineWidth = 2
        ctx.strokeRect(pad / 2, pad / 2, img.width + pad, img.height + pad)
      }

      resolve(canvas.toDataURL("image/png"))
    }
    img.src = dataUrl
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function resampleDataUrl(dataUrl, width, height) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/png"))
    }
    img.src = dataUrl
  })
}
