import React from "react"
import { useTranslation } from "react-i18next"
import PostCard from "../PostCard"
import { isSameDay, WEEKDAY_KEYS } from "@/utils/dateUtils"

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function formatHour(hour) {
  if (hour === 12) return "12 PM"
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

export default function DayHourlyView({ posts = [], currentDate = new Date() }) {
  const { t } = useTranslation()

  const dayKey = WEEKDAY_KEYS[currentDate.getDay()]
  const dayName = t(`planner.weekdays.${dayKey}`)
  const dateNum = currentDate.getDate()
  const isToday = isSameDay(currentDate, new Date())

  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, "0")
  const dateStr = String(dateNum).padStart(2, "0")
  const fullDate = `${year}-${month}-${dateStr}`

  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-x-auto shadow-2xs flex flex-col">
      {/* Day Header Row */}
      <div className="grid grid-cols-[80px_1fr] border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        <div className="h-14 border-r border-border" />
        <div className="h-14 flex items-center justify-center gap-3 px-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {dayName}
          </span>
          <span
            className={`h-8 w-8 rounded-full font-extrabold text-sm flex items-center justify-center shadow-xs ${
              isToday
                ? "bg-[hsl(var(--sidebar-primary))] text-white"
                : "bg-card border border-border text-foreground"
            }`}
          >
            {dateNum}
          </span>
        </div>
      </div>

      {/* Hourly Slots */}
      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {HOURS.map((hour) => {
          const matchingPosts = posts.filter(
            (p) => p.date === fullDate && p.hour === hour
          )

          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] min-h-[90px] group">
              <div className="p-3 border-r border-border text-xs font-semibold text-muted-foreground text-right pr-4 bg-slate-50/30 dark:bg-slate-900/30">
                {formatHour(hour)}
              </div>

              <div className="p-2 relative transition-colors hover:bg-slate-100/30 dark:hover:bg-slate-800/30">
                {matchingPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {matchingPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full w-full rounded-xl border border-dashed border-border/40 flex items-center justify-center text-muted-foreground/40 text-xs hover:border-indigo-400/50 hover:text-indigo-500 transition-colors cursor-pointer font-medium">
                    {t("planner.labels.add_post_at", { time: formatHour(hour) })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
