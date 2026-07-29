import React, { useState } from "react"
import { createPortal } from "react-dom"
import { usePostComposerFacade } from "@/facades/usePostComposerFacade"

// Import 7 Region Components + Modals/Panels
import ModalHeader from "./regions/ModalHeader"
import PlatformSelectorRegion from "./regions/PlatformSelectorRegion"
import ContentComposerRegion from "./regions/ContentComposerRegion"
import PresetsRegion from "./regions/PresetsRegion"
import ValidationErrorRegion from "./regions/ValidationErrorRegion"
import ModalFooterRegion from "./regions/ModalFooterRegion"
import LivePreviewRegion from "./regions/LivePreviewRegion"
import PostTemplateSelectorModal from "./PostTemplateSelectorModal"
import PostNotesPanel from "./PostNotesPanel"

export default function PostComposerModal({
  isOpen,
  onClose,
  brandId,
  initialMedia = null,
  initialScheduledAt = null,
  onSuccess,
}) {
  const {
    draft,
    updateDraft,
    updateYoutubeOption,
    addPendingFiles,
    removePendingFile,
    pendingFiles,
    updatePreset,
    updateNetworkCaption,
    isEditByNetwork,
    toggleEditByNetwork,
    activeNetworkTab,
    setNetworkTab,
    toggleUseTemplate,
    updateThreadPostText,
    addThreadPost,
    removeThreadPost,
    setThreadActiveIndex,
    selectedPlatforms,
    togglePlatform,
    postFormat,
    setPostFormat,
    activePreviewPlatform,
    setActivePreviewPlatform,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    applyTemplate,
    hasBlockingErrors,
    isSubmitting,
    handleSubmit,
  } = usePostComposerFacade(initialScheduledAt, brandId, onSuccess, onClose)

  const [platformFormats, setPlatformFormats] = useState({
    FACEBOOK: "POST",
    INSTAGRAM: "REEL",
    YOUTUBE: "VIDEO",
  })
  const [isNotesOpen, setIsNotesOpen] = useState(false)

  if (!isOpen) return null

  // Initialize initial media if passed from Drive drop
  if (initialMedia && draft.mediaUrls.length === 0) {
    updateDraft("mediaUrls", [initialMedia.url || initialMedia.name])
  }

  const handleFormatChange = (platformId, format) => {
    setPlatformFormats((prev) => ({ ...prev, [platformId]: format }))
    setPostFormat(format)
  }

  const postsCount = draft.networkCustom?.THREADS?.threadPosts?.length || 2

  const modalJSX = (
    /* Full-Screen Workspace Modal Overlay Portal (98vw x 96vh) */
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 animate-fade-in font-sans">
      
      {/* Expanded Ultra-Wide Modal Container */}
      <div className="w-[98vw] h-[96vh] bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[1000000]">
        
        {/* REGION 1: Header Region */}
        <ModalHeader user={{ name: "Nhã Võ", initials: "NH" }} onClose={onClose} />

        {/* Dual-Column Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Column Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800">
            
            {/* Scrollable Container for Regions 2, 3, 4 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* REGION 2: Platform & Post Type Selection Region */}
              <PlatformSelectorRegion
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                platformFormats={platformFormats}
                onFormatChange={handleFormatChange}
                isEditByNetwork={isEditByNetwork}
                onToggleEditByNetwork={toggleEditByNetwork}
                onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
              />

              {/* REGION 3: Main Content Composer & Editor Region */}
              <ContentComposerRegion
                caption={draft.caption}
                onChangeCaption={(val) => updateDraft("caption", val)}
                mediaUrls={draft.mediaUrls}
                onMediaChange={(newUrls) => updateDraft("mediaUrls", newUrls)}
                onAddPendingFiles={addPendingFiles}
                onRemovePendingFile={removePendingFile}
                pendingFiles={pendingFiles}
                maxCharacters={300}
                maxHashtags={30}
                // Edit by network props
                isEditByNetwork={isEditByNetwork}
                activeNetworkTab={activeNetworkTab}
                onSelectNetworkTab={setNetworkTab}
                selectedPlatforms={selectedPlatforms}
                networkCustom={draft.networkCustom}
                onToggleUseTemplate={toggleUseTemplate}
                onUpdateThreadPostText={updateThreadPostText}
                onUpdateNetworkCaption={updateNetworkCaption}
                onAddThreadPost={addThreadPost}
                onRemoveThreadPost={removeThreadPost}
                onSetThreadActiveIndex={setThreadActiveIndex}
              />

              {/* REGION 4: Presets Accordion Region */}
              <PresetsRegion
                selectedPlatforms={selectedPlatforms}
                platformFormats={platformFormats}
                youtubeOptions={draft.youtubeOptions}
                onUpdateYoutubeOption={updateYoutubeOption}
                presets={draft.presets}
                onUpdatePreset={updatePreset}
              />
            </div>

            {/* PINNED FIXED BOTTOM AREA for Region 5 & Region 6 (ALWAYS VISIBLE, NO SCROLLING NEEDED!) */}
            <div className="px-6 py-3 border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 space-y-3">
              {/* REGION 5: Validation & Error Region */}
              <ValidationErrorRegion />

              {/* REGION 6: Action & Schedule Footer Region */}
              <ModalFooterRegion
                scheduledAt={draft.scheduledAt}
                onScheduledAtChange={(val) => updateDraft("scheduledAt", val)}
                onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                hasBlockingErrors={hasBlockingErrors}
                onCancel={onClose}
                postsCount={postsCount}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Swappable View (LivePreviewRegion OR PostNotesPanel) */}
          {isNotesOpen ? (
            /* REGION 7 ALT: Post Notes Panel (Right Column w-[520px]) */
            <PostNotesPanel onClose={() => setIsNotesOpen(false)} />
          ) : (
            /* REGION 7: Live Preview Region (Right Column - Full Height w-[520px]) */
            <LivePreviewRegion
              selectedPlatforms={selectedPlatforms}
              activePreviewPlatform={activePreviewPlatform}
              onSelectPreviewPlatform={setActivePreviewPlatform}
              draft={draft}
              postFormat={postFormat}
              onSetThreadActiveIndex={setThreadActiveIndex}
              pendingFiles={pendingFiles}
            />
          )}
        </div>
      </div>

      {/* Post Template Selector Modal */}
      {isTemplateModalOpen && (
        <PostTemplateSelectorModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={applyTemplate}
        />
      )}
    </div>
  )

  return createPortal(modalJSX, document.body)
}
