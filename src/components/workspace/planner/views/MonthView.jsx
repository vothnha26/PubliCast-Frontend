import React from "react"
import { SOCIAL_PLATFORM } from "@/constants/planner"

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

// Generate month matrix for demo (e.g. 35 days)
const MONTH_DAYS = Array.from({ length: 35 }, (_, i) => {
  const dayNum = i + 1
  if (dayNum <= 31) {
    return {
      day: dayNum,
      isCurrentMonth: true,
      isToday: dayNum === 18,
      dots: dayNum === 2 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id] :
            dayNum === 9 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.INSTAGRAM.id] :
            dayNum === 18 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id, SOCIAL_PLATFORM.TIKTOK.id] :
            dayNum === 25 ? [SOCIAL_PLATFORM.FACEBOOK.id, SOCIAL_PLATFORM.YOUTUBE.id] :
            dayNum === 30 ? [SOCIAL_PLATFORM.YOUTUBE.id, SOCIAL_PLATFORM.INSTAGRAM.id, SOCIAL_PLATFORM.TIKTOK.id] : [],
      chips: dayNum === 4 ? [{ label: "2 POSTS", color: "bg-indigo-500/10 text-indigo-600" }] :
             dayNum === 9 ? [{ label: "Q4 Strategy...", color: "bg-blue-500/10 text-blue-600" }] :
             dayNum === 15 ? [{ label: "1 REEL", color: "bg-amber-500/10 text-amber-600" }] : [],
      moreCount: dayNum === 18 ? 2 : dayNum === 30 ? 4 : 0,
    }
  }
  return {
    day: dayNum - 31,
    isCurrentMonth: false,
    isToday: false,
    dots: [],
    chips: [],
    moreCount: 0,
  }
})

export default function MonthView() {
  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-2xs select-none">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2.5 text-center text-[11px] font-bold text-muted-foreground tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* 5-Week Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-border">
        {MONTH_DAYS.map((cell, idx) => (
          <div
            key={idx}
            className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
              !cell.isCurrentMonth
                ? "bg-slate-50/40 dark:bg-slate-900/40 text-muted-foreground/50"
                : cell.isToday
                ? "bg-[hsl(var(--sidebar-primary)/0.06)]"
                : "hover:bg-slate-100/30 dark:hover:bg-slate-800/30"
            }`}
          >
            {/* Top Row: Day Number & Today Tag */}
            <div className="flex items-center justify-between">
              {cell.isToday ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-[hsl(var(--sidebar-primary))] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {cell.day}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[hsl(var(--sidebar-primary))]">
                    TODAY
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
              {cell.chips.map((chip, cIdx) => (
                <div key={cIdx} className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate ${chip.color}`}>
                  {chip.label}
                </div>
              ))}

              {cell.dots.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {cell.dots.map((pId, dIdx) => {
                    const platform = SOCIAL_PLATFORM[pId] || SOCIAL_PLATFORM.FACEBOOK
                    return (
                      <span key={dIdx} className={`h-2 w-2 rounded-full ${platform.dotClass}`} />
                    )
                  })}
                  {cell.moreCount > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      +{cell.moreCount} more
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
