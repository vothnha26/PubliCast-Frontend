import React from "react"
import { CALENDAR_VIEW_MODE } from "@/constants/planner"
import WeekHourlyView from "./WeekHourlyView"
import WeekCompactView from "./WeekCompactView"
import MonthView from "./MonthView"

export default function CalendarViewFactory({ viewMode, posts }) {
  const renderView = () => {
    switch (viewMode) {
      case CALENDAR_VIEW_MODE.WEEK_COMPACT:
        return <WeekCompactView posts={posts} />

      case CALENDAR_VIEW_MODE.MONTH:
        return <MonthView posts={posts} />

      case CALENDAR_VIEW_MODE.DAY:
        return <WeekHourlyView posts={posts} />

      case CALENDAR_VIEW_MODE.LIST:
        return <WeekCompactView posts={posts} />

      case CALENDAR_VIEW_MODE.WEEK_HOURLY:
      default:
        return <WeekHourlyView posts={posts} />
    }
  }

  return (
    <div key={viewMode} className="flex-1 flex flex-col h-full animate-fade-in">
      {renderView()}
    </div>
  )
}
