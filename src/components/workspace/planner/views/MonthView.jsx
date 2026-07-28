import React, { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SOCIAL_PLATFORM } from "@/constants/planner"
import { isSameDay, WEEKDAY_KEYS } from "@/utils/dateUtils"
import PostQuickPreview from "../PostQuickPreview"

// Xây lưới 6 tuần (42 ô) bao trọn tháng của currentDate, bắt đầu từ Chủ Nhật
// của tuần chứa ngày 1 — đủ chỗ cho mọi tháng kể cả tháng bắt đầu vào Thứ Bảy.
function buildMonthGrid(currentDate) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sun
  const gridStart = new Date(year, month, 1 - startOffset)
  const today = new Date()

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return {
      day: d.getDate(),
      fullDate: `${y}-${m}-${day}`,
      isCurrentMonth: d.getMonth() === month,
      isToday: isSameDay(d, today),
    }
  })
}

export default function MonthView({ posts = [], currentDate = new Date() }) {
  const { t } = useTranslation()
  const [hoveredCell, setHoveredCell] = useState(null)

  const gridCells = useMemo(() => buildMonthGrid(currentDate), [currentDate])

  // Gom post theo ngày 1 lần (thay vì filter posts.length lần trong lúc render
  // từng ô) — tránh quét lại toàn bộ mảng posts cho mỗi ô trong lưới 42 ô.
  const postsByDate = useMemo(() => {
    const map = new Map()
    for (const post of posts) {
      if (!post.date) continue
      if (!map.has(post.date)) map.set(post.date, [])
      map.get(post.date).push(post)
    }
    return map
  }, [posts])

  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-2xs">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="py-2.5 text-center text-[11px] font-bold text-muted-foreground tracking-wider">
            {t(`planner.weekdays.${key}`)}
          </div>
        ))}
      </div>

      {/* 6-Week Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-border">
        {gridCells.map((cell, idx) => {
          const dayPosts = postsByDate.get(cell.fullDate) || []
          const firstPost = dayPosts[0]
          const extraCount = Math.max(0, dayPosts.length - 3)

          return (
            <div
              key={cell.fullDate}
              onMouseEnter={() => setHoveredCell(firstPost ? idx : null)}
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
              {hoveredCell === idx && firstPost && (
                <div className="absolute left-2 top-8 z-50">
                  <PostQuickPreview post={firstPost} />
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

              {/* Post Dots */}
              {dayPosts.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {dayPosts.slice(0, 3).map((post) => {
                    const platform = SOCIAL_PLATFORM[post.platform] || SOCIAL_PLATFORM.INSTAGRAM
                    return <span key={post.id} className={`h-2 w-2 rounded-full ${platform.dotClass} shadow-2xs`} />
                  })}
                  {extraCount > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">+{extraCount}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
