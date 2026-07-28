import React, { useEffect, useMemo } from "react"
import { useContentPlanner } from "@/store/useContentPlanner"
import PlannerSubHeader from "@/components/workspace/planner/PlannerSubHeader"
import CalendarViewFactory from "@/components/workspace/planner/views/CalendarViewFactory"
import PlannerInsightsPanel from "@/components/workspace/planner/PlannerInsightsPanel"
import PlannerSkeleton from "@/components/workspace/planner/PlannerSkeleton"

export default function ContentPlannerPage() {
  const { viewMode, currentDate, isLoading, posts, selectedPlatforms, fetchPlannerData, getFilteredPosts } = useContentPlanner()

  useEffect(() => {
    fetchPlannerData()
  }, [fetchPlannerData])

  const filteredPosts = useMemo(() => getFilteredPosts(), [posts, selectedPlatforms, getFilteredPosts])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden p-6 space-y-3 bg-muted/10">
      {isLoading ? (
        <PlannerSkeleton />
      ) : (
        <>
          {/* SubHeader: Date Navigation, View Mode, Platform Filters, Search */}
          <PlannerSubHeader />

          {/* Main Content Area: Calendar Grid + Insights Sidebar */}
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Left Calendar Grid (Primary Scroll Container) */}
            <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pr-1 rounded-2xl">
              <CalendarViewFactory viewMode={viewMode} posts={filteredPosts} currentDate={currentDate} />
            </div>

            {/* Right Insights Sidebar (Fixed / Non-overlapping Scroll) */}
            <PlannerInsightsPanel />
          </div>
        </>
      )}
    </div>
  )
}
