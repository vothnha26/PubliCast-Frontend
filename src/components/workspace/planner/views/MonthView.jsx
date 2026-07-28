import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { SOCIAL_PLATFORM } from "@/constants/planner"
import PostQuickPreview from "../PostQuickPreview"

const WEEKDAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

// Matrix of days for demo month
const MONTH_DAYS = Array.from({ length: 35 }, (_, i) => {
  const dayNum = i + 1
  if (dayNum <= 31) {
    const isToday = dayNum === 18
    const mockPost = dayNum === 18 || dayNum === 9 || dayNum === 2 ? {
      id: `month-post-${dayNum}`,
      title: dayNum === 18 ? "PubliCast Q4 Feature Launch Video" : "Weekly Analytics Strategy Overview",
      platform: dayNum === 18 ? "YOUTUBE" : "INSTAGRAM",
      status: "SCHEDULED",
      date: `2026-11-${String(dayNum).padStart(2, "0")}`,
      timeLabel: "10:30 AM",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    } : null

    return {
      day: dayNum,
      isCurrentMonth: true,
      isToday,
      mockPost,
      dots: dayNum === 2 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id] :
            dayNum === 9 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.INSTAGRAM.id] :
            dayNum === 18 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id, SOCIAL_PLATFORM.TIKTOK.id] :
            dayNum === 25 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id] :
            dayNum === 30 ? [SOCIAL_PLATFORM.YOUTUBE.id, SOCIAL_PLATFORM.INSTAGRAM.id, SOCIAL_PLATFORM.TIKTOK.id] : [],
      chipKey: dayNum === 4 ? "2_posts" : dayNum === 9 ? "q4_strategy" : dayNum === 15 ? "1_reel" : null,
      moreCount: dayNum === 18 ? 2 : dayNum === 30 ? 4 : 0,
    }
  }
  return {
    day: dayNum - 31,
    isCurrentMonth: false,
    isToday: false,
    mockPost: null,
    dots: [],
    chipKey: null,
    moreCount: 0,
  }
})

export default function MonthView() {
  const { t } = useTranslation()
  const [hoveredCell, setHoveredCell] = useState(null)

  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-2xs select-none">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="py-2.5 text-center text-[11px] font-bold text-muted-foreground tracking-wider">
            {t(`planner.weekdays.${key}`)}
          </div>
        ))}
      </div>

      {/* 5-Week Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-border">
        {MONTH_DAYS.map((cell, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredCell(cell.mockPost ? idx : null)}
            onMouseLeave={() => setHoveredCell(null)}
            className={`p-2 min-h-[90px] flex flex-col justify-between transition-all relative ${
              !cell.isCurrentMonth
                ? "bg-slate-50/40 dark:bg-slate-900/40 text-muted-foreground/50"
                : cell.isToday
                ? "bg-[hsl(var(--sidebar-primary)/0.06)]"
                : "hover:bg-slate-100/40 dark:hover:bg-slate-800/40"
            }`}
          >
            {/* Hover Quick Preview Popover */}
            {hoveredCell === idx && cell.mockPost && (
              <div className="absolute left-2 top-8 z-50">
                <PostQuickPreview post={cell.mockPost} />
              </div>
            )}

            {/* Top Row: Day Number & Today Tag */}
            <div className="flex items-center justify-between">
              {cell.isToday ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-[hsl(var(--sidebar-primary))] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {cell.day}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[hsl(var(--sidebar-primary))]">
                    {t("planner.labels.today_caps")}
                  </span>
                </div>
              ) : (
                <span className={`text-xs font-bold ${cell.isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {cell.day}
                </span>
              )}
            </div>

            {/* Chips or Dots */}
            <div className="space-y-1 my-1">
              {cell.chipKey === "2_posts" && (
                <div className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {t("planner.labels.posts_count", { count: 2 })}
                </div>
              )}
              {cell.chipKey === "q4_strategy" && (
                <div className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Q4 Strategy...
                </div>
              )}
              {cell.chipKey === "1_reel" && (
                <div className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  1 REEL
                </div>
              )}

              {cell.dots.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {cell.dots.map((pId, dIdx) => {
                    const platform = SOCIAL_PLATFORM[pId] || SOCIAL_PLATFORM.FACEBOOK
                    return (
                      <span key={dIdx} className={`h-2 w-2 rounded-full ${platform.dotClass} shadow-2xs`} />
                    )
                  })}
                  {cell.moreCount > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      +{cell.moreCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
