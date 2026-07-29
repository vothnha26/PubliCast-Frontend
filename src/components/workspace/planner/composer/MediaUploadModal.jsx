import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { UploadCloud, Link2, FolderOpen, X, Check, Search, FileImage, FileVideo, Trash2 } from "lucide-react"

// Mock Media Library items for demonstration
const SAMPLE_MEDIA_LIBRARY = [
  { id: "lib-1", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", title: "Abstract Gradient.jpg", size: "1.2 MB" },
  { id: "lib-2", type: "image", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80", title: "Artwork Illustration.jpg", size: "2.4 MB" },
  { id: "lib-3", type: "image", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80", title: "Technology Desk.jpg", size: "3.1 MB" },
  { id: "lib-4", type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", title: "Product Promo Video.mp4", size: "8.5 MB" },
  { id: "lib-5", type: "image", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", title: "Team Collaboration.jpg", size: "1.8 MB" },
  { id: "lib-6", type: "image", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", title: "Analytics Dashboard.jpg", size: "2.0 MB" },
]

export default function MediaUploadModal({
  isOpen,
  onClose,
  mediaType = "image", // "image" | "video"
  onAcceptFiles, // (files: File[]) => void
  onAcceptUrl, // (url: string) => void
  onAcceptLibraryItems, // (urls: string[]) => void
  isUploading = false,
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("FROM_COMPUTER") // "FROM_COMPUTER" | "FROM_URL" | "MEDIA_LIBRARY"
  const [selectedFiles, setSelectedFiles] = useState([])
  const [urlInput, setUrlInput] = useState("")
  const [selectedLibraryIds, setSelectedLibraryIds] = useState([])
  const [librarySearch, setLibrarySearch] = useState("")
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const isVideo = mediaType === "video"
  const acceptType = isVideo ? "video/*" : "image/*"
  const modalTitle = isVideo ? t("composer.video_upload") : t("composer.image_upload")

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
    e.target.value = "" // reset input for future selections
  }

  const handleRemoveFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const toggleLibrarySelect = (id) => {
    setSelectedLibraryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAccept = () => {
    if (activeTab === "FROM_COMPUTER") {
      if (selectedFiles.length > 0 && onAcceptFiles) {
        onAcceptFiles(selectedFiles)
        setSelectedFiles([])
      }
    } else if (activeTab === "FROM_URL") {
      if (urlInput.trim() && onAcceptUrl) {
        onAcceptUrl(urlInput.trim())
        setUrlInput("")
      }
    } else if (activeTab === "MEDIA_LIBRARY") {
      if (selectedLibraryIds.length > 0 && onAcceptLibraryItems) {
        const selectedUrls = SAMPLE_MEDIA_LIBRARY.filter((item) =>
          selectedLibraryIds.includes(item.id)
        ).map((item) => item.url)
        onAcceptLibraryItems(selectedUrls)
        setSelectedLibraryIds([])
      }
    }
    onClose()
  }

  const filteredLibrary = SAMPLE_MEDIA_LIBRARY.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(librarySearch.toLowerCase())
    const matchesType = isVideo ? item.type === "video" : true
    return matchesSearch && matchesType
  })

  const isAcceptDisabled =
    isUploading ||
    (activeTab === "FROM_COMPUTER" && selectedFiles.length === 0) ||
    (activeTab === "FROM_URL" && !urlInput.trim()) ||
    (activeTab === "MEDIA_LIBRARY" && selectedLibraryIds.length === 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans select-none">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scale-in">
        
        {/* Header: Title + Circular Top-Right Dark Close Button */}
        <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 shrink-0">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {modalTitle}
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

        {/* Dark Sub-Header Tab Bar */}
        <div className="bg-[#24172b] px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {/* Tab 1: From computer */}
          <button
            type="button"
            onClick={() => setActiveTab("FROM_COMPUTER")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "FROM_COMPUTER"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>{t("composer.from_computer")}</span>
          </button>

          {/* Tab 2: From URL */}
          <button
            type="button"
            onClick={() => setActiveTab("FROM_URL")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "FROM_URL"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>{t("composer.from_url")}</span>
          </button>

          {/* Tab 3: Media Library */}
          <button
            type="button"
            onClick={() => setActiveTab("MEDIA_LIBRARY")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "MEDIA_LIBRARY"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>{t("composer.media_library")}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 bg-white dark:bg-slate-900 flex-1 min-h-[280px] max-h-[420px] overflow-y-auto">
          
          {/* TAB 1: FROM COMPUTER (Dashed Dropzone) */}
          {activeTab === "FROM_COMPUTER" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptType}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl min-h-[200px] flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-slate-800/40 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {t("composer.drag_drop_hint")}
                </p>
                <span className="text-[11px] text-slate-400 font-semibold mt-1">
                  {isVideo ? t("composer.supported_formats_video") : t("composer.supported_formats_image")}
                </span>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {t("composer.selected_files", { count: selectedFiles.length })}
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {file.type.startsWith("image/") ? (
                            <FileImage className="h-5 w-5 text-indigo-500 shrink-0" />
                          ) : (
                            <FileVideo className="h-5 w-5 text-purple-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(idx)
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FROM URL */}
          {activeTab === "FROM_URL" && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                {t("composer.media_url_label")}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={t("composer.paste_url_placeholder")}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold shadow-xs"
                />
              </div>

              {/* URL Preview Area */}
              {urlInput.trim() && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    {t("composer.live_media_preview")}
                  </span>
                  {isVideo ? (
                    <video src={urlInput} controls className="max-h-40 rounded-xl max-w-full" />
                  ) : (
                    <img
                      src={urlInput}
                      alt="URL Preview"
                      className="max-h-40 rounded-xl max-w-full object-contain shadow-xs"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA LIBRARY */}
          {activeTab === "MEDIA_LIBRARY" && (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder={t("composer.search_media_library_placeholder")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold shadow-xs"
                />
              </div>

              {/* Library Grid */}
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredLibrary.map((item) => {
                  const isSelected = selectedLibraryIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleLibrarySelect(item.id)}
                      className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group aspect-video bg-slate-100 dark:bg-slate-800 ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/30 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {item.type === "image" ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                          <FileVideo className="h-8 w-8 text-purple-400" />
                        </div>
                      )}

                      {/* Selection Check Badge */}
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md scale-100"
                            : "bg-black/40 text-transparent opacity-0 group-hover:opacity-100 scale-90"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>

                      {/* Title overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white font-bold truncate">
                        {item.title}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            {t("composer.cancel")}
          </button>

          <button
            type="button"
            disabled={isAcceptDisabled}
            onClick={handleAccept}
            className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md ${
              isAcceptDisabled
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                : "bg-[#24172b] hover:bg-[#34223f] text-[#facc15] active:scale-95"
            }`}
          >
            {isUploading ? t("composer.uploading") : t("composer.accept")}
          </button>
        </div>

      </div>
    </div>
  )
}
