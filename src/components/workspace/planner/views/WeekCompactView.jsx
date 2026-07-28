import React from "react"
import PostCard from "../PostCard"
import { getWeekDays } from "@/utils/dateUtils"

export default function WeekCompactView({ posts = [], currentDate = new Date() }) {
  const days = getWeekDays(currentDate)

  return (
    <div className="flex-1 border border-border rounded-2xl bg-card overflow-hidden grid grid-cols-7 divide-x divide-border shadow-2xs select-none">
      {days.map((d) => {
        const dayPosts = posts.filter((p) => p.date === d.fullDate)

        return (
          <div
            key={d.date}
            className={`flex flex-col min-h-[500px] ${
              d.isToday ? "bg-[hsl(var(--sidebar-primary)/0.03)]" : ""
            }`}
          >
            {/* Header Column */}
            <div
              className={`p-3 text-center border-b border-border ${
                d.isToday
                  ? "bg-[hsl(var(--sidebar-primary)/0.1)] border-b-2 border-b-[hsl(var(--sidebar-primary))]"
                  : "bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {d.day}
              </span>
              <span
                className={`text-base font-extrabold mt-0.5 inline-block ${
                  d.isToday ? "text-[hsl(var(--sidebar-primary))]" : "text-foreground"
                }`}
              >
                {d.date}
              </span>
            </div>

            {/* Posts List Body */}
            <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
              {dayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {dayPosts.length === 0 && (
                <PostCard variant="empty" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
