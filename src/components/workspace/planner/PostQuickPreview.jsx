import React from "react"
import { useTranslation } from "react-i18next"
import { POST_STATUS, SOCIAL_PLATFORM } from "@/constants/planner"
import { Clock, Share2, Image as ImageIcon } from "lucide-react"

export default function PostQuickPreview({ post }) {
  const { t } = useTranslation()

  if (!post) return null

  const statusConfig = POST_STATUS[post.status] || POST_STATUS.SCHEDULED
  const platformConfig = SOCIAL_PLATFORM[post.platform] || SOCIAL_PLATFORM.INSTAGRAM

  return (
    <div className="w-64 p-3 rounded-2xl bg-card border border-border shadow-xl space-y-2.5 animate-scale-in text-foreground z-50">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${platformConfig.dotClass}`}>
          <span>{platformConfig.name}</span>
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${statusConfig.badgeClass}`}>
          {t(statusConfig.labelKey)}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
          <span>{t("planner.labels.scheduled_for")}: <strong>{post.date} ({post.timeLabel})</strong></span>
        </div>
      </div>
    </div>
  )
}
