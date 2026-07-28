import React, { useState, useEffect } from "react"
import { CALENDAR_VIEW_MODE } from "@/constants/planner"
import WeekHourlyView from "./WeekHourlyView"
import WeekCompactView from "./WeekCompactView"
import MonthView from "./MonthView"
import DayHourlyView from "./DayHourlyView"

export default function CalendarViewFactory({ viewMode, posts, currentDate }) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Smooth transition pulse when view mode or date changes
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [viewMode, currentDate])

  const renderView = () => {
    if (isTransitioning) {
      return (
        <div className="flex-1 border border-border rounded-2xl bg-card p-6 flex flex-col gap-4 animate-pulse">
          <div className="h-10 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
          <div className="grid grid-cols-7 gap-3 flex-1 min-h-[450px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-full bg-slate-100/70 dark:bg-slate-900/70 rounded-xl flex flex-col p-2 gap-2">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded self-center" />
                <div className="h-16 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-lg mt-4" />
                <div className="h-16 w-full bg-slate-200/30 dark:bg-slate-800/30 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )
    }

    switch (viewMode) {
      case CALENDAR_VIEW_MODE.WEEK_COMPACT:
        return <WeekCompactView posts={posts} currentDate={currentDate} />

      case CALENDAR_VIEW_MODE.MONTH:
        return <MonthView posts={posts} currentDate={currentDate} />

      case CALENDAR_VIEW_MODE.DAY:
        return <DayHourlyView posts={posts} currentDate={currentDate} />

      case CALENDAR_VIEW_MODE.LIST:
        return <WeekCompactView posts={posts} currentDate={currentDate} />

      case CALENDAR_VIEW_MODE.WEEK_HOURLY:
      default:
        return <WeekHourlyView posts={posts} currentDate={currentDate} />
    }
  }

  return (
    <div key={`${viewMode}-${currentDate?.getTime()}`} className="flex-1 flex flex-col h-full animate-fade-in">
      {renderView()}
    </div>
  )
}
