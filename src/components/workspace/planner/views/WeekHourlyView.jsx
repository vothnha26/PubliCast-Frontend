import React from "react"
import PostCard from "../PostCard"

const DAYS = [
  { day: "MON", date: "18", fullDate: "2026-11-18" },
  { day: "TUE", date: "19", fullDate: "2026-11-19" },
  { day: "WED", date: "20", fullDate: "2026-11-20", isToday: true },
  { day: "THU", date: "21", fullDate: "2026-11-21" },
  { day: "FRI", date: "22", fullDate: "2026-11-22" },
  { day: "SAT", date: "23", fullDate: "2026-11-23" },
  { day: "SUN", date: "24", fullDate: "2026-11-24" },
]

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function formatHour(hour) {
  if (hour === 12) return "12 PM"
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

export default function WeekHourlyView({ posts = [] }) {
  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-x-auto shadow-2xs select-none">
      {/* 7 Days Header Row */}
      <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        <div className="h-14 border-r border-border" />
        {DAYS.map((d) => (
          <div
            key={d.date}
            className={`h-14 flex flex-col items-center justify-center border-r last:border-r-0 border-border px-2 transition-colors ${
              d.isToday ? "bg-[hsl(var(--sidebar-primary)/0.08)]" : ""
            }`}
          >
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {d.day}
            </span>
            <div className="flex items-center justify-center mt-0.5">
              {d.isToday ? (
                <span className="h-7 w-7 rounded-full bg-[hsl(var(--sidebar-primary))] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {d.date}
                </span>
              ) : (
                <span className="text-sm font-extrabold text-foreground">{d.date}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Grid Rows */}
      <div className="relative divide-y divide-border">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[70px_repeat(7,1fr)] min-h-[96px] group">
            {/* Hour Label Column */}
            <div className="p-2 border-r border-border text-[11px] font-semibold text-muted-foreground text-right pr-3 select-none bg-slate-50/30 dark:bg-slate-900/30">
              {formatHour(hour)}
            </div>

            {/* 7 Day Slot Cells */}
            {DAYS.map((d) => {
              const matchingPosts = posts.filter(
                (p) => p.date === d.fullDate && p.hour === hour
              )

              return (
                <div
                  key={`${d.date}-${hour}`}
                  className={`p-1.5 border-r last:border-r-0 border-border relative transition-colors hover:bg-slate-100/40 dark:hover:bg-slate-800/40 ${
                    d.isToday ? "bg-[hsl(var(--sidebar-primary)/0.03)]" : ""
                  }`}
                >
                  {/* Current Time Indicator Line for Wed 20 at 10:30 AM */}
                  {d.isToday && hour === 10 && (
                    <div className="absolute top-1/2 left-0 right-0 z-20 flex items-center pointer-events-none">
                      <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--sidebar-primary))] -ml-1.25 shadow-xs" />
                      <div className="h-0.5 w-full bg-[hsl(var(--sidebar-primary))]" />
                    </div>
                  )}

                  {matchingPosts.length > 0 ? (
                    <div className="space-y-1.5">
                      {matchingPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : d.date === "21" && hour === 9 ? (
                    <PostCard variant="skeleton" />
                  ) : d.date === "24" && hour === 18 ? (
                    <PostCard variant="skeleton" />
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
