import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Smile,
  Hash,
  MapPin,
  Link2,
  Calendar,
  FolderOpen,
  Lock,
  Plus,
  X,
  Pencil,
  ChevronRight,
} from "lucide-react"
import { NETWORK_TAB_TEMPLATE, SOCIAL_PLATFORM } from "@/constants/postComposer"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import MediaUploadModal from "../MediaUploadModal"
import ImageEditorModal from "../ImageEditorModal"
import VideoEditorModal from "../VideoEditorModal"

export default function ContentComposerRegion({
  brandId,
  caption = "",
  onChangeCaption,
  mediaUrls = [],
  onMediaChange,
  onAddPendingFiles,
  onRemovePendingFile,
  onUpdateNetworkMedia,
  pendingFiles,
  maxCharacters = 300,
  maxHashtags = 30,
  // Edit by Network props
  isEditByNetwork = false,
  activeNetworkTab = NETWORK_TAB_TEMPLATE,
  onSelectNetworkTab,
  selectedPlatforms = [],
  networkCustom = {},
  onToggleUseTemplate,
  onUpdateThreadPostText,
  onUpdateNetworkCaption,
  onAddThreadPost,
  onRemoveThreadPost,
  onSetThreadActiveIndex,
}) {
  const { t } = useTranslation()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMediaMenu, setShowMediaMenu] = useState(false)

  // Media Upload Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [mediaModalType, setMediaModalType] = useState("image") // "image" | "video"

  // Image Editor Modal State
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [editingImageIndex, setEditingImageIndex] = useState(null)
  const [editingImageUrl, setEditingImageUrl] = useState("")

  // Video Editor Modal State
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false)
  const [editingVideoIndex, setEditingVideoIndex] = useState(null)
  const [editingVideoUrl, setEditingVideoUrl] = useState("")

  // Current tab network config
  const isTemplateTab = activeNetworkTab === NETWORK_TAB_TEMPLATE
  const isThreadsTab = activeNetworkTab === SOCIAL_PLATFORM.THREADS
  const currentNetworkConfig = networkCustom[activeNetworkTab] || {}
  const isUseTemplate = currentNetworkConfig.useTemplate ?? true
  const activeThreadIndex = currentNetworkConfig.activeThreadIndex || 0
  const threadsConfig = networkCustom.THREADS || { threadPosts: [""] }

  // Active caption text for current network context
  let activeCaption = caption
  if (isEditByNetwork && !isTemplateTab) {
    if (isThreadsTab) {
      activeCaption = threadsConfig.threadPosts[activeThreadIndex] || ""
    } else {
      activeCaption = currentNetworkConfig.caption || ""
    }
  }

  // Active mediaUrls array for current network context
  let activeMediaUrls = mediaUrls
  if (isEditByNetwork && !isTemplateTab && !isUseTemplate && Array.isArray(currentNetworkConfig.mediaUrls)) {
    activeMediaUrls = currentNetworkConfig.mediaUrls
  }

  const openMediaEditor = (idx, url) => {
    if (isVideoUrl(url)) {
      setEditingVideoIndex(idx)
      setEditingVideoUrl(url)
      setIsVideoEditorOpen(true)
    } else {
      setEditingImageIndex(idx)
      setEditingImageUrl(url)
      setIsImageEditorOpen(true)
    }
  }

  const handleSaveEditedImage = (newUrl) => {
    if (editingImageIndex !== null && newUrl) {
      const updated = [...activeMediaUrls]
      updated[editingImageIndex] = newUrl
      if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
        if (onUpdateNetworkMedia) onUpdateNetworkMedia(activeNetworkTab, updated)
      } else {
        onMediaChange(updated)
      }
    }
  }

  const handleSaveEditedVideo = (newUrl) => {
    if (editingVideoIndex !== null && newUrl) {
      const updated = [...activeMediaUrls]
      updated[editingVideoIndex] = newUrl
      if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
        if (onUpdateNetworkMedia) onUpdateNetworkMedia(activeNetworkTab, updated)
      } else {
        onMediaChange(updated)
      }
    }
  }

  const handleTextareaChange = (val) => {
    if (!isEditByNetwork || isTemplateTab) {
      onChangeCaption(val)
    } else if (isThreadsTab) {
      if (onUpdateThreadPostText) onUpdateThreadPostText(activeThreadIndex, val)
    } else {
      if (onUpdateNetworkCaption) onUpdateNetworkCaption(activeNetworkTab, val)
    }
  }

  const handleUploadFiles = (files) => {
    if (files.length === 0) return
    setShowMediaMenu(false)
    if (onAddPendingFiles) {
      if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
        onAddPendingFiles(files, activeNetworkTab)
      } else {
        onAddPendingFiles(files)
      }
    }
  }

  const handleAddMediaUrl = (url) => {
    if (url) {
      if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
        if (onUpdateNetworkMedia) onUpdateNetworkMedia(activeNetworkTab, [...activeMediaUrls, url])
      } else {
        onMediaChange([...mediaUrls, url])
      }
    }
  }

  const handleAddLibraryUrls = (urls) => {
    if (urls && urls.length > 0) {
      if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
        if (onUpdateNetworkMedia) onUpdateNetworkMedia(activeNetworkTab, [...activeMediaUrls, ...urls])
      } else {
        onMediaChange([...mediaUrls, ...urls])
      }
    }
  }

  const handleRemoveMedia = (index) => {
    if (isEditByNetwork && !isTemplateTab && !isUseTemplate) {
      if (onRemovePendingFile) {
        onRemovePendingFile(index, activeNetworkTab)
      } else if (onUpdateNetworkMedia) {
        onUpdateNetworkMedia(activeNetworkTab, activeMediaUrls.filter((_, i) => i !== index))
      }
    } else {
      if (onRemovePendingFile) {
        onRemovePendingFile(index)
      } else {
        onMediaChange(mediaUrls.filter((_, i) => i !== index))
      }
    }
  }

  const handleAddEmoji = (emoji) => {
    handleTextareaChange(activeCaption + emoji)
    setShowEmojiPicker(false)
  }

  const charCount = activeCaption.length

  // blob: URLs carry no filename/extension of their own (URL.createObjectURL
  // strips it), so a pending file's real type must come from the File object
  // itself (pendingFiles, keyed by blob URL — see usePostComposerFacade's
  // addPendingFiles). Once uploaded, mediaUrls holds the real Cloudinary URL
  // instead, which does have a real extension to check.
  const isVideoUrl = (url) => {
    const pendingType = pendingFiles?.get(url)?.type
    if (pendingType) return pendingType.startsWith("video/")
    return /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url)
  }

  const openMediaModal = (type = "image") => {
    setMediaModalType(type)
    setIsMediaModalOpen(true)
    setShowMediaMenu(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative transition-all font-sans">
      
      {/* Interactive Media Upload Modal */}
      <MediaUploadModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaType={mediaModalType}
        onAcceptFiles={handleUploadFiles}
        onAcceptUrl={handleAddMediaUrl}
        onAcceptLibraryItems={handleAddLibraryUrls}
      />

      {/* TOP HEADER: NETWORK TABS (ONLY WHEN EDIT BY NETWORK IS ON) */}
      {isEditByNetwork && (
        <div className="mb-4 space-y-3 pb-3 border-b border-slate-200 dark:border-slate-800 animate-fade-in">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
            {/* Tabs List */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => onSelectNetworkTab && onSelectNetworkTab(NETWORK_TAB_TEMPLATE)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isTemplateTab
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                CÀI ĐẶT CHUNG
              </button>

              {selectedPlatforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => onSelectNetworkTab && onSelectNetworkTab(plat)}
                  title={plat}
                  className={`flex items-center justify-center px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeNetworkTab === plat
                      ? "bg-white dark:bg-slate-900 shadow-xs ring-1 ring-indigo-500/40"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <PlatformIcon platform={plat} size={18} />
                </button>
              ))}
            </div>

            {/* Checkbox "Use template" for sub-networks */}
            {!isTemplateTab && (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUseTemplate}
                  onChange={(e) => onToggleUseTemplate && onToggleUseTemplate(activeNetworkTab, e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>{t("composer.use_template")}</span>
              </label>
            )}
          </div>

          {/* THREADS SUB-TABS (Post 1, Post 2, + Add post) */}
          {isThreadsTab && (
            <div className="flex items-center gap-2 pt-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-full w-fit">
              {(threadsConfig.threadPosts || [""]).map((_, index) => {
                const isPostActive = activeThreadIndex === index
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSetThreadActiveIndex && onSetThreadActiveIndex(index)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                      isPostActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-200 shrink-0">
                      {index + 1}
                    </span>
                    <span>Post {index + 1}</span>
                    {threadsConfig.threadPosts.length > 1 && (
                      <X
                        className="h-3.5 w-3.5 hover:text-rose-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onRemoveThreadPost) onRemoveThreadPost(index)
                        }}
                      />
                    )}
                  </button>
                )
              })}

              {/* Plus Button to add post */}
              <button
                type="button"
                onClick={onAddThreadPost}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shrink-0"
                title="Thêm bài viết vào chuỗi Threads"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDITOR BODY CONTENT OR LOCKED STATE */}
      {!isTemplateTab && isUseTemplate ? (
        /* LOCKED STATE */
        <div className="my-6 p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/80 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-sm leading-relaxed">
            {t("composer.stop_template_hint")}
          </p>
          <button
            type="button"
            onClick={() => onToggleUseTemplate && onToggleUseTemplate(activeNetworkTab, false)}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            {t("composer.edit_content")}
          </button>
        </div>
      ) : (
        /* UNLOCKED REALTIME RICH TEXT EDITOR WITH EXPANDED SPACIOUS TEXTAREA */
        <>
          <textarea
            id="input-composer-caption"
            value={activeCaption}
            onChange={(e) => handleTextareaChange(e.target.value)}
            placeholder={
              isTemplateTab
                ? t("composer.placeholder_template")
                : t("composer.placeholder_custom")
            }
            rows={10}
            className="w-full min-h-[220px] bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-y text-sm font-medium leading-relaxed"
          />

          {/* Media Thumbnails Area */}
          {activeMediaUrls.length > 0 && (
            <div id="input-media-dropzone" className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {activeMediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 group shadow-xs">
                  {isVideoUrl(url) ? (
                    <video src={url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => openMediaEditor(idx, url)}
                    className="absolute top-1 left-1 p-1 bg-black/75 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-amber-400"
                    title={isVideoUrl(url) ? "Chỉnh sửa video" : "Chỉnh sửa hình ảnh"}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/75 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Formatting Toolbar & Realtime Counters */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            {/* Toolbar Icons */}
            <div className="flex items-center gap-1">
              {/* Media Upload Dropdown Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-media-dropdown-trigger"
                  onClick={() => {
                    setShowMediaMenu(!showMediaMenu)
                    setShowEmojiPicker(false)
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    showMediaMenu
                      ? "bg-slate-200 dark:bg-slate-800 text-indigo-600"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  }`}
                  title={t("composer.add_image")}
                >
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4.5 w-4.5" />
                    <VideoIcon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </button>

                {/* High-Fidelity Media Menu */}
                {showMediaMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-60 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 animate-scale-in text-xs font-semibold space-y-1">
                    <button
                      type="button"
                      onClick={() => openMediaModal("image")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <span className="font-extrabold">{t("composer.add_image")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openMediaModal("video")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <VideoIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <span className="font-extrabold">{t("composer.add_video")}</span>
                    </button>

                    <div className="my-1.5 border-t border-slate-200 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={() => setShowMediaMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center font-serif font-black text-amber-600 text-xs">
                        Ae
                      </div>
                      <span>Adobe Express</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMediaMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.6 66.85l12.45-21.55H87.3L74.85 66.85z" fill="#0066DA" />
                        <path d="M43.65 2.65L31.2 24.2l31.2 54.05L74.85 66.85z" fill="#00AC47" />
                        <path d="M43.65 2.65L6.6 66.85h24.6L56.1 24.2z" fill="#EA4335" />
                        <path d="M43.65 2.65L19.05 45.3h24.6L68.25 2.65z" fill="#FFBA00" />
                      </svg>
                      <span>Google Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMediaMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] italic">
                        C
                      </div>
                      <span>Canva</span>
                    </button>

                    <div className="my-1.5 border-t border-slate-200 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={() => openMediaModal("image")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-4 w-4 text-slate-500" />
                        <span>{t("composer.stock_images")}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openMediaModal("video")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <VideoIcon className="h-4 w-4 text-slate-500" />
                        <span>{t("composer.stock_videos")}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openMediaModal("image")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[9px] font-black text-slate-700 dark:text-slate-300">
                          GIF
                        </div>
                        <span>{t("composer.gifs_gallery")}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Emoji Picker Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker)
                    setShowMediaMenu(false)
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    showEmojiPicker
                      ? "bg-slate-200 dark:bg-slate-800 text-indigo-600"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  }`}
                  title="Chèn biểu tượng Emoji"
                >
                  <Smile className="h-4.5 w-4.5" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute left-0 bottom-full mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl grid grid-cols-6 gap-2 z-50 animate-scale-in">
                    {["🔥", "❤️", "👍", "🚀", "💡", "🎉", "✨", "📌", "⭐", "😍", "🎯", "👏"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleAddEmoji(em)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-lg transition-transform hover:scale-110 cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hashtag Suggestion Helper */}
              <button
                type="button"
                onClick={() => handleTextareaChange(activeCaption + " #PubliCast")}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
                title="Gợi ý Hashtag"
              >
                <Hash className="h-4.5 w-4.5" />
              </button>

              {/* Location Tag */}
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
                title="Gắn vị trí"
              >
                <MapPin className="h-4.5 w-4.5" />
              </button>

              {/* Shorten Link */}
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
                title="Rút gọn liên kết"
              >
                <Link2 className="h-4.5 w-4.5" />
              </button>

              {/* AI Assistant Generator */}
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
                title="Trợ lý AI viết bài"
              >
                <Calendar className="h-4.5 w-4.5" />
              </button>

              {/* Media Library Asset Picker */}
              <button
                type="button"
                onClick={() => openMediaModal("image")}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
                title="Kho thư viện phương tiện"
              >
                <FolderOpen className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Right Side: Realtime Character & Hashtag Counter */}
            <div className="flex items-center gap-3 font-mono font-bold text-[11px] text-slate-600 dark:text-slate-300">
              <span className={charCount > maxCharacters ? "text-rose-600 font-extrabold" : ""}>
                {charCount} / {maxCharacters}
              </span>

              {/* Dynamic Platform Indicator Icon */}
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                🦋
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Editor Modal */}
      <ImageEditorModal
        isOpen={isImageEditorOpen}
        onClose={() => setIsImageEditorOpen(false)}
        imageUrl={editingImageUrl}
        onSave={handleSaveEditedImage}
      />

      {/* Video Editor Modal */}
      <VideoEditorModal
        isOpen={isVideoEditorOpen}
        onClose={() => setIsVideoEditorOpen(false)}
        videoUrl={editingVideoUrl}
        onSave={handleSaveEditedVideo}
        brandId={brandId}
      />
    </div>
  )
}
