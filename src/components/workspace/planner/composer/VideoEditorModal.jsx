import React, { useState, useRef, useEffect, useCallback } from "react"
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
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { postService } from "@/services/postService"

// Filter presets mapped to backend preset names
const FILTER_PRESETS = [
  { id: "default", backendPreset: "none", name: "Gốc", class: "filter-none" },
  { id: "mono", backendPreset: "grayscale", name: "Đen trắng", class: "grayscale contrast-125" },
  { id: "sepia", backendPreset: "sepia", name: "Sepia", class: "sepia" },
  { id: "rust", backendPreset: "vintage", name: "Vintage", class: "sepia-75 hue-rotate-345 saturate-150" },
  { id: "warm", backendPreset: "warm", name: "Ấm áp", class: "sepia-30 saturate-120 hue-rotate-15" },
  { id: "cold", backendPreset: "cool", name: "Tươi mát", class: "hue-rotate-180 saturate-120" },
  { id: "chrome", backendPreset: "dramatic", name: "Nổi bật", class: "contrast-125 saturate-150" },
]

const ZOOM_PRESETS = [
  { value: 25, label: "25%" },
  { value: 26, label: "26% Fit to view" },
  { value: 50, label: "50%" },
  { value: 100, label: "100% Actual size" },
  { value: 125, label: "125%" },
  { value: 150, label: "150%" },
  { value: 200, label: "200%" },
  { value: 300, label: "300%" },
  { value: 400, label: "400%" },
  { value: 600, label: "600%" },
  { value: 800, label: "800%" },
  { value: 1600, label: "1600%" },
]

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export default function VideoEditorModal({
  isOpen,
  onClose,
  videoUrl,
  onSave,
  brandId = "unassigned",
}) {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState("CROP") // "CROP" | "SIZE" | "FINETUNE" | "FILTER" | "STICKER" | "DRAW" | "RESIZE"

  // Audio state
  const [saveAudio, setSaveAudio] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // CROP & Trim & Aspect Ratio State
  const [currentTime, setCurrentTime] = useState("0:00")
  const [playheadTime, setPlayheadTime] = useState(0)
  const [duration, setDuration] = useState(10)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(10)
  const [aspectRatio, setAspectRatio] = useState("original") // 'original' | '1:1' | '9:16' | '16:9'
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
  const [isResizeDirty, setIsResizeDirty] = useState(false)
  const [isAspectLocked, setIsAspectLocked] = useState(true)

  // Zoom
  const [zoomLevel, setZoomLevel] = useState(26)

  // API Backend Processing & Polling State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")
  const [errorMessage, setErrorMessage] = useState(null)

  // Ref tracking for cleanup and polling safety
  const pollIntervalRef = useRef(null)
  const isMountedRef = useRef(true)
  const pollCountRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopPolling()
    }
  }, [stopPolling])

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false)
      setErrorMessage(null)
      setStartTime(0)
      setEndTime(10)
      setIsResizeDirty(false)
    } else {
      stopPolling()
    }
  }, [isOpen, stopPolling])

  const startPolling = useCallback(
    (taskId) => {
      stopPolling()
      pollCountRef.current = 0
      setIsProcessing(true)

      pollIntervalRef.current = setInterval(async () => {
        if (!isMountedRef.current) {
          stopPolling()
          return
        }

        pollCountRef.current += 1
        // Max polling attempts: 120 * 1.5s = 180s (3 minutes)
        if (pollCountRef.current > 120) {
          stopPolling()
          if (isMountedRef.current) {
            setIsProcessing(false)
            setErrorMessage("Thời gian xử lý video quá lâu (Timeout 3 phút). Vui lòng thử lại sau.")
          }
          return
        }

        try {
          const statusRes = await postService.getTrimStatus(taskId)
          console.log(`[VideoEditorModal] Poll status (${pollCountRef.current}/120) for ${taskId}:`, statusRes)

          if (!isMountedRef.current) {
            stopPolling()
            return
          }

          if (statusRes.status === "SUCCESS") {
            stopPolling()
            setIsProcessing(false)
            if (onSave && statusRes.videoUrl) {
              onSave(statusRes.videoUrl)
            }
            onClose()
          } else if (statusRes.status === "FAILED") {
            stopPolling()
            setIsProcessing(false)
            setErrorMessage(statusRes.error || "Xử lý video thất bại trong tiến trình FFmpeg.")
          }
        } catch (pollErr) {
          console.error("[VideoEditorModal] Error polling status:", pollErr)
          const statusCode = pollErr?.response?.status
          if (statusCode === 404) {
            stopPolling()
            if (isMountedRef.current) {
              setIsProcessing(false)
              setErrorMessage("Không tìm thấy tiến trình xử lý video hoặc công việc đã bị hủy/hết hạn.")
            }
          }
        }
      }, 1500)
    },
    [onClose, onSave, stopPolling]
  )

  if (!isOpen) return null

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      if (dur && !isNaN(dur)) {
        setDuration(dur)
        setEndTime(dur)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDraggingPlayhead.current) {
      const t = videoRef.current.currentTime
      setPlayheadTime(t)
      const mins = Math.floor(t / 60)
      const secs = Math.floor(t % 60).toString().padStart(2, "0")
      setCurrentTime(`${mins}:${secs}`)
    }
  }

  const handleSave = async () => {
    if (!videoUrl) return

    setIsProcessing(true)
    setErrorMessage(null)
    setProcessingStatus("Đang gửi yêu cầu xử lý video...")

    try {
      const selectedPresetObj = FILTER_PRESETS.find((f) => f.id === selectedFilter)
      const filterPreset = selectedPresetObj ? selectedPresetObj.backendPreset : "none"

      const isResizeActive = isResizeDirty || activeTool === "RESIZE"

      const payload = {
        videoUrl,
        startTime: Number(startTime) || 0,
        endTime: Number(endTime) || duration || 10,
        aspectRatio,
        adjustments: {
          brightness: Number(finetuneValues.Brightness) || 0,
          contrast: Number(finetuneValues.Contrast) || 0,
          saturation: Number(finetuneValues.Saturation) || 0,
        },
        filterPreset,
        resize:
          isResizeActive && Number(customWidth) > 0 && Number(customHeight) > 0
            ? { width: Number(customWidth), height: Number(customHeight) }
            : undefined,
        saveAudio,
        keepAudio: saveAudio,
        audioVolume: saveAudio ? 100 : 0,
        brandId,
      }

      console.log("[VideoEditorModal] Submitting video trim payload:", payload)
      const response = await postService.trimVideo(payload)
      const taskId = response?.taskId

      if (!taskId) {
        if (response?.videoUrl) {
          if (onSave) onSave(response.videoUrl)
          onClose()
          return
        }
        throw new Error("Không phản hồi taskId từ máy chủ.")
      }

      setProcessingStatus("Đang áp dụng bộ lọc và render video qua FFmpeg...")
      startPolling(taskId)
    } catch (err) {
      console.error("[VideoEditorModal] Error initiating video trim:", err)
      const existingTaskId = err?.response?.data?.taskId
      if (err?.response?.status === 429 && existingTaskId) {
        setProcessingStatus("Đang tiếp tục theo dõi tiến trình xử lý video sẵn có...")
        startPolling(existingTaskId)
        return
      }

      setIsProcessing(false)
      setErrorMessage(err?.response?.data?.message || err.message || "Đã xảy ra lỗi khi kết nối với máy chủ.")
    }
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

  // Filmstrip Thumbnails & Zoom Popover State
  const [frameThumbnails, setFrameThumbnails] = useState([])
  const [showZoomMenu, setShowZoomMenu] = useState(false)
  const timelineRef = useRef(null)
  const isDraggingPlayhead = useRef(false)
  const isDraggingStartHandle = useRef(false)
  const isDraggingEndHandle = useRef(false)
  const isDraggingRangeBox = useRef(false)
  const dragRangeStartOffsetSec = useRef(0)
  const dragRangeWindowSec = useRef(0)

  // Generate 16 filmstrip frame thumbnails from video
  useEffect(() => {
    if (!sampleVideo || !duration || duration <= 0) return
    let isCancelled = false

    const generateFrames = async () => {
      try {
        const frameCount = 16
        const tempVideo = document.createElement("video")
        tempVideo.crossOrigin = "anonymous"
        tempVideo.src = sampleVideo
        tempVideo.muted = true
        tempVideo.playsInline = true

        await new Promise((resolve) => {
          tempVideo.onloadeddata = resolve
          tempVideo.onerror = resolve
        })

        if (isCancelled || !tempVideo.duration) return

        const canvas = document.createElement("canvas")
        canvas.width = 120
        canvas.height = 68
        const ctx = canvas.getContext("2d")

        const thumbs = []
        const step = tempVideo.duration / frameCount

        for (let i = 0; i < frameCount; i++) {
          if (isCancelled) break
          const targetTime = Math.min(i * step, tempVideo.duration - 0.1)
          tempVideo.currentTime = targetTime

          await new Promise((res) => {
            const onSeeked = () => {
              tempVideo.removeEventListener("seeked", onSeeked)
              res()
            }
            tempVideo.addEventListener("seeked", onSeeked)
          })

          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height)
            thumbs.push(canvas.toDataURL("image/jpeg", 0.5))
          }
        }

        if (!isCancelled && thumbs.length > 0) {
          setFrameThumbnails(thumbs)
        }
      } catch (err) {
        console.warn("[VideoEditorModal] Could not generate video frame thumbnails:", err)
      }
    }

    generateFrames()

    return () => {
      isCancelled = true
    }
  }, [sampleVideo, duration])

  const rafIdRef = useRef(null)

  // Drag handles & range box event listeners for trimming with requestAnimationFrame
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!timelineRef.current || duration <= 0) return
      if (
        !isDraggingPlayhead.current &&
        !isDraggingStartHandle.current &&
        !isDraggingEndHandle.current &&
        !isDraggingRangeBox.current
      )
        return

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const rect = timelineRef.current.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const targetSec = Math.max(0, Math.min(duration, pct * duration))

        if (isDraggingPlayhead.current) {
          setPlayheadTime(targetSec)
          if (videoRef.current) {
            videoRef.current.currentTime = targetSec
          }
        } else if (isDraggingStartHandle.current) {
          const newStart = Math.min(targetSec, endTime - 0.2)
          setStartTime(newStart)
          setPlayheadTime(newStart)
          if (videoRef.current) {
            videoRef.current.currentTime = newStart
          }
        } else if (isDraggingEndHandle.current) {
          const newEnd = Math.max(targetSec, startTime + 0.2)
          setEndTime(newEnd)
          setPlayheadTime(newEnd)
          if (videoRef.current) {
            videoRef.current.currentTime = newEnd
          }
        } else if (isDraggingRangeBox.current) {
          const win = dragRangeWindowSec.current
          const newStart = Math.max(0, Math.min(duration - win, targetSec - dragRangeStartOffsetSec.current))
          const newEnd = Math.min(duration, newStart + win)
          setStartTime(newStart)
          setEndTime(newEnd)
          setPlayheadTime(newStart)
          if (videoRef.current) {
            videoRef.current.currentTime = newStart
          }
        }
      })
    }

    const handleMouseUp = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      isDraggingPlayhead.current = false
      isDraggingStartHandle.current = false
      isDraggingEndHandle.current = false
      isDraggingRangeBox.current = false
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [duration, startTime, endTime])

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
        
        {/* PROCESSING OVERLAY SPINNER */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 text-white">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black tracking-tight">{processingStatus}</h3>
              <p className="text-xs text-slate-400 font-medium">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
        )}

        {/* TOP HEADER: Title + Close Button */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("composer.video_editor", "Trình chỉnh sửa Video")}
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

        {/* ERROR ALERT NOTIFICATION */}
        {errorMessage && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
              <span className="text-[11px]">{t("composer.crop", "Cắt & Tỉ lệ")}</span>
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
              <span className="text-[11px]">{t("composer.editor_size", "Kích thước")}</span>
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
              <span className="text-[11px]">{t("composer.editor_finetune", "Tinh chỉnh")}</span>
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
              <span className="text-[11px]">{t("composer.editor_filter", "Bộ lọc")}</span>
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
              <span className="text-[11px]">{t("composer.editor_sticker", "Nhãn dán")}</span>
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
              <span className="text-[11px]">{t("composer.editor_draw", "Vẽ")}</span>
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
              <span className="text-[11px]">{t("composer.editor_resize", "Đổi cỡ")}</span>
            </button>

          </div>

          {/* CENTER CANVAS & FLOATING ACTION BARS */}
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-white dark:bg-slate-900 relative overflow-hidden">
            
            {/* TOP ACTION BAR OVERLAY: Undo, Redo, Zoom Dropdown, Save audio [On|Off] */}
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

              {/* Zoom controls with Dropdown Menu (Mockup 2) */}
              <div className="relative flex items-center gap-1 px-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(10, prev - 5))}
                  className="px-1.5 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer font-black"
                >
                  -
                </button>

                <button
                  type="button"
                  onClick={() => setShowZoomMenu((prev) => !prev)}
                  className="px-2 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white cursor-pointer font-extrabold flex items-center gap-1"
                >
                  <span>{zoomLevel}%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(1600, prev + 5))}
                  className="px-1.5 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer font-black"
                >
                  +
                </button>

                {/* Zoom Dropdown Menu Popover */}
                {showZoomMenu && (
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 w-48 z-50 max-h-72 overflow-y-auto">
                    {ZOOM_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setZoomLevel(preset.value)
                          setShowZoomMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors flex flex-col cursor-pointer ${
                          zoomLevel === preset.value
                            ? "bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-white font-extrabold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 font-medium"
                        }`}
                      >
                        <span className="font-bold">{preset.value}%</span>
                        {preset.label.includes(" ") && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {preset.label.split(" ").slice(1).join(" ")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-0.5" />

              {/* Save audio [ On | Off ] toggle pill */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("composer.save_audio", "Âm thanh")}</span>
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

            {/* VIDEO PREVIEW CANVAS WITH FLOATING PLAYER CONTROLS (Mockup 1) */}
            <div className="relative my-auto flex items-center justify-center max-w-full max-h-[300px] p-2">
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black max-h-[260px] aspect-[9/16]">
                <video
                  ref={videoRef}
                  src={sampleVideo}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  style={previewFilterStyle}
                  className={`w-full h-full object-cover transition-all duration-200 ${
                    FILTER_PRESETS.find((f) => f.id === selectedFilter)?.class || ""
                  }`}
                  loop
                  playsInline
                />

                {/* Floating Video Controls Pill (Play, Mute, Split) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-slate-200/80 dark:border-slate-700 z-20">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-white shadow-xs transition-all cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-600"
                    title={isPlaying ? "Tạm dừng" : "Phát"}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-white shadow-xs transition-all cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-600"
                    title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        setStartTime(videoRef.current.currentTime)
                      }
                    }}
                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow-xs flex items-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-600"
                    title="Tách clip tại vị trí hiện tại"
                  >
                    <Scissors className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Split</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RICH FILMSTRIP TIMELINE TRACK WITH TIME RULER & PLAYHEAD PIN (Mockup 1) */}
            <div className="w-full max-w-2xl px-2 py-1 flex flex-col items-center select-none shrink-0">
              {/* Time Ruler Track (Timestamp Labels & Tick Marks) */}
              <div
                className="w-full relative h-6 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-0.5 cursor-pointer"
                onClick={(e) => {
                  if (!timelineRef.current || duration <= 0) return
                  const rect = timelineRef.current.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const targetSec = pct * duration
                  setPlayheadTime(targetSec)
                  if (videoRef.current) {
                    videoRef.current.currentTime = targetSec
                  }
                }}
              >
                <span>0:00</span>
                <div className="flex-1 mx-4 flex justify-between items-center opacity-40">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-0.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
                  ))}
                </div>
                <span>{formatTime(duration)}</span>

                {/* Current Playhead Pin badge & vertical line */}
                {duration > 0 && (
                  <div
                    className="absolute top-0 flex flex-col items-center -translate-x-1/2 cursor-grab active:cursor-grabbing z-30 transition-none group/pin"
                    style={{
                      left: `${Math.max(0, Math.min(100, (playheadTime / duration) * 100))}%`,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      isDraggingPlayhead.current = true
                    }}
                  >
                    <div className="bg-black text-white text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md shadow-md border border-slate-800 whitespace-nowrap group-hover/pin:scale-110 transition-transform">
                      {formatTime(playheadTime)}
                    </div>
                    <div className="w-0.5 h-12 bg-black dark:bg-white shadow-sm pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Filmstrip Frame Thumbnails Track Container */}
              <div
                ref={timelineRef}
                onClick={(e) => {
                  if (!timelineRef.current || duration <= 0) return
                  const rect = timelineRef.current.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const targetSec = pct * duration
                  setPlayheadTime(targetSec)
                  if (videoRef.current) {
                    videoRef.current.currentTime = targetSec
                  }
                }}
                className="w-full relative h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 shadow-inner flex items-center cursor-pointer group"
              >
                {/* Render filmstrip frames or fallback gradient */}
                {frameThumbnails.length > 0 ? (
                  <div className="w-full h-full flex">
                    {frameThumbnails.map((thumb, idx) => (
                      <img
                        key={idx}
                        src={thumb}
                        alt={`frame-${idx}`}
                        className="flex-1 h-full object-cover border-r border-black/20 pointer-events-none"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex">
                    {[...Array(16)].map((_, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 border-r border-slate-700/50"
                      />
                    ))}
                  </div>
                )}

                {/* Excluded start time mask */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/60 backdrop-blur-[1px] pointer-events-none z-10"
                  style={{ width: `${(startTime / duration) * 100}%` }}
                />

                {/* Excluded end time mask */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/60 backdrop-blur-[1px] pointer-events-none z-10"
                  style={{ width: `${100 - (endTime / duration) * 100}%` }}
                />

                {/* Draggable Active Time Range Window Box */}
                <div
                  className="absolute top-0 bottom-0 border-t-2 border-b-2 border-amber-400/90 z-15 cursor-grab active:cursor-grabbing group/range flex items-center justify-center bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    width: `${((endTime - startTime) / duration) * 100}%`,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    if (!timelineRef.current || duration <= 0) return
                    const rect = timelineRef.current.getBoundingClientRect()
                    const clickPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                    const clickSec = clickPct * duration
                    dragRangeStartOffsetSec.current = clickSec - startTime
                    dragRangeWindowSec.current = endTime - startTime
                    isDraggingRangeBox.current = true
                  }}
                >
                  <div className="text-[9px] font-mono font-black text-amber-300 bg-black/80 px-2 py-0.5 rounded-full backdrop-blur-xs opacity-0 group-hover/range:opacity-100 transition-opacity pointer-events-none shadow-md">
                    Kéo khoảng: {formatTime(endTime - startTime)}
                  </div>
                </div>

                {/* Left Gold Trim Handle */}
                <div
                  className="absolute top-0 bottom-0 w-3.5 bg-amber-400 border border-amber-500 rounded-l-md flex items-center justify-center cursor-ew-resize z-20 shadow-md group-hover:scale-105 transition-transform"
                  style={{ left: `${(startTime / duration) * 100}%` }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    isDraggingStartHandle.current = true
                  }}
                >
                  <div className="w-0.5 h-4 bg-amber-800 rounded-full" />
                </div>

                {/* Right Gold Trim Handle */}
                <div
                  className="absolute top-0 bottom-0 w-3.5 bg-amber-400 border border-amber-500 rounded-r-md flex items-center justify-center cursor-ew-resize z-20 shadow-md group-hover:scale-105 transition-transform"
                  style={{ left: `calc(${(endTime / duration) * 100}% - 14px)` }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    isDraggingEndHandle.current = true
                  }}
                >
                  <div className="w-0.5 h-4 bg-amber-800 rounded-full" />
                </div>
              </div>
            </div>

            {/* BOTTOM SUB-CONTROLS PANEL */}
            <div className="w-full flex flex-col items-center justify-center space-y-3 pt-1 shrink-0">
              
              {/* 1. CROP & ASPECT RATIO SUB-CONTROLS */}
              {activeTool === "CROP" && (
                <div className="w-full max-w-xl flex flex-col items-center space-y-3">
                  {/* Aspect Ratio Selector Pills */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: "original", label: "Gốc" },
                      { id: "1:1", label: "1:1 (Vuông)" },
                      { id: "9:16", label: "9:16 (Dọc)" },
                      { id: "16:9", label: "16:9 (Ngang)" },
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          aspectRatio === ratio.id
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>

                  {/* Trim Range Inputs */}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span>Bắt đầu:</span>
                      <input
                        type="number"
                        min="0"
                        max={endTime}
                        step="0.1"
                        value={startTime}
                        onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                        className="w-14 bg-transparent font-mono text-center focus:outline-none font-bold"
                      />
                      <span>s</span>
                    </div>

                    <span>—</span>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span>Kết thúc:</span>
                      <input
                        type="number"
                        min={startTime}
                        max={duration}
                        step="0.1"
                        value={endTime}
                        onChange={(e) => setEndTime(Math.min(duration, Number(e.target.value)))}
                        className="w-14 bg-transparent font-mono text-center focus:outline-none font-bold"
                      />
                      <span>s</span>
                    </div>
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
                    {t("composer.editor_rotation", "Xoay")}
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
                    {t("composer.editor_scale", "Thu phóng")}
                  </button>
                </div>
              )}

              {/* 3. FINETUNE Sub-controls & Sliders */}
              {activeTool === "FINETUNE" && (
                <div className="w-full max-w-md space-y-3 flex flex-col items-center">
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full px-4 no-scrollbar">
                    {["Brightness", "Contrast", "Saturation"].map((item) => (
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

                  <div className="flex items-center gap-3 w-full px-6">
                    <span className="text-xs font-bold text-slate-500 w-20">{finetuneSubTab}:</span>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={finetuneValues[finetuneSubTab] || 0}
                      onChange={(e) =>
                        setFinetuneValues((prev) => ({
                          ...prev,
                          [finetuneSubTab]: Number(e.target.value),
                        }))
                      }
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold w-10 text-right">
                      {finetuneValues[finetuneSubTab] || 0}
                    </span>
                  </div>
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
                      onChange={(e) => {
                        setCustomWidth(Number(e.target.value))
                        setIsResizeDirty(true)
                      }}
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
                      onChange={(e) => {
                        setCustomHeight(Number(e.target.value))
                        setIsResizeDirty(true)
                      }}
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
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t("composer.cancel", "Hủy")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2 rounded-xl text-xs font-black bg-[#24172b] hover:bg-[#34223f] text-[#facc15] shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{t("composer.editor_save", "Lưu thay đổi")}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
