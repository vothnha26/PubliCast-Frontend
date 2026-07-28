import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { X, Calendar, Clock, Send, Image as ImageIcon, Video, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { postService } from "@/services/postService"
import { POST_CREATE_STATUS } from "@/constants/post"

export default function MinimalPostCreatorModal({
  isOpen,
  onClose,
  brandId,
  initialMedia,
  initialScheduledAt,
  onSuccess,
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState({
    caption: "",
    scheduledAt: initialScheduledAt || new Date().toISOString(),
    mediaUrls: initialMedia?.url ? [initialMedia.url] : [],
    targetPlatforms: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!brandId) {
      toast.error("Chưa xác định được brand — không thể tạo bài viết.")
      return
    }
    setIsSubmitting(true)
    try {
      const created = await postService.createPost({
        brandId,
        title: initialMedia?.name || draft.caption.slice(0, 60) || "Untitled post",
        caption: draft.caption,
        scheduledAt: draft.scheduledAt,
        mediaUrls: draft.mediaUrls,
        targetPlatforms: draft.targetPlatforms,
        status: POST_CREATE_STATUS.DRAFT,
      })
      toast.success("Bài viết đã được lưu (bản nháp)!")
      if (onSuccess) onSuccess(created)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không tạo được bài viết.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--sidebar-primary))] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ✍️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">{t("planner.creator.title")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("planner.creator.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Media Preview Box */}
          {initialMedia && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              {initialMedia.url ? (
                <img
                  src={initialMedia.url}
                  alt={initialMedia.name}
                  className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-muted-foreground shrink-0">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">{initialMedia.name}</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("planner.creator.drive_imported")}
                </p>
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {t("planner.creator.caption_label")}
            </label>
            <textarea
              rows={4}
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              placeholder={t("planner.creator.caption_placeholder")}
              className="w-full p-3 text-xs rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-800/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-primary))]"
            />
          </div>

          {/* Scheduled Date Display */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">{t("planner.creator.scheduled_time")}</span>
            </div>
            <span className="text-xs font-black text-indigo-900 dark:text-indigo-100 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl shadow-2xs">
              {new Date(draft.scheduledAt).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-bold rounded-xl"
            >
              {t("planner.creator.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs font-bold rounded-xl bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-1.5 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "..." : t("planner.creator.submit")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
