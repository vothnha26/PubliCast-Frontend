import React from "react"
import { useTranslation } from "react-i18next"
import { POST_STATUS, SOCIAL_PLATFORM } from "@/constants/planner"
import { Image as ImageIcon, X } from "lucide-react"
import { PlatformIcon } from "@/components/shared/PlatformIcon"

export default function PostCard({ post, variant = "full", onRemove }) {
  const { t } = useTranslation()

  if (variant === "skeleton") {
    return (
      <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-between animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-2.5 w-14 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (variant === "empty") {
    return (
      <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer group">
        <span className="text-xl font-light group-hover:scale-110 transition-transform">+</span>
      </div>
    )
  }

  const statusConfig = POST_STATUS[post.status] || POST_STATUS.SCHEDULED
  const platformConfig = SOCIAL_PLATFORM[post.platform] || SOCIAL_PLATFORM.INSTAGRAM
  const platformIconName = platformConfig.iconName

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border shadow-2xs text-[11px] font-medium truncate">
        <PlatformIcon platform={platformIconName} size={12} variant="flat" />
        <span className="truncate">{post.title}</span>
      </div>
    )
  }

  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-2 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer">
      {onRemove && (
        <button
          onClick={() => onRemove(post.id)}
          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-muted-foreground z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Thumbnail */}
      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        {/* Platform Badge Overlay — always visible (not hover-only), real brand icon */}
        <div className="absolute top-1.5 right-1.5 shadow-xs rounded-md group-hover:scale-110 transition-transform bg-white/90 dark:bg-slate-900/90 p-0.5">
          <PlatformIcon platform={platformIconName} size={16} variant="color" />
        </div>
      </div>

      {/* Title */}
      <h5 className="text-xs font-bold tracking-tight text-foreground line-clamp-1 mb-2">
        {post.title}
      </h5>

      {/* Footer: Status Badge + Time */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
        <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase border ${statusConfig.badgeClass}`}>
          {t(statusConfig.labelKey)}
        </span>
        <span className="font-medium text-muted-foreground">{post.timeLabel}</span>
      </div>
    </div>
  )
}
