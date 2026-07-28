import React from "react"
import { CALENDAR_VIEW_MODE } from "@/constants/planner"
import WeekHourlyView from "./WeekHourlyView"
import WeekCompactView from "./WeekCompactView"
import MonthView from "./MonthView"
import DayHourlyView from "./DayHourlyView"

export default function CalendarViewFactory({ viewMode, posts, currentDate }) {
  const renderView = () => {
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
    <div key={viewMode} className="flex-1 flex flex-col h-full animate-fade-in">
      {renderView()}
    </div>
  )
}
