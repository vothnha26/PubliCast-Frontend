import React, { useEffect } from "react"
import { useContentPlanner } from "@/store/useContentPlanner"
import PlannerSubHeader from "@/components/workspace/planner/PlannerSubHeader"
import CalendarViewFactory from "@/components/workspace/planner/views/CalendarViewFactory"
import PlannerInsightsPanel from "@/components/workspace/planner/PlannerInsightsPanel"
import PlannerSkeleton from "@/components/workspace/planner/PlannerSkeleton"

export default function ContentPlannerPage() {
  const { viewMode, isLoading, fetchPlannerData, getFilteredPosts } = useContentPlanner()

  useEffect(() => {
    fetchPlannerData()
  }, [fetchPlannerData])

  const filteredPosts = getFilteredPosts()

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden p-6 space-y-4">
      {isLoading ? (
        <PlannerSkeleton />
      ) : (
        <>
          {/* SubHeader: Date Navigation, View Mode, Platform Filters */}
          <PlannerSubHeader />

          {/* Main Content Area: Calendar Grid + Insights Sidebar */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left Calendar Grid (Strategy View) */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <CalendarViewFactory viewMode={viewMode} posts={filteredPosts} />
            </div>

            {/* Right Insights Sidebar */}
            <PlannerInsightsPanel />
          </div>
        </>
      )}
    </div>
  )
}
