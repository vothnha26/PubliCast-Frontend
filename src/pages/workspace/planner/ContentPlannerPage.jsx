import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useContentPlanner } from "@/store/useContentPlanner"
import { useBrandStore } from "@/store/useBrandStore"
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { buildScheduledDate } from "@/utils/dateUtils"
import PlannerSubHeader from "@/components/workspace/planner/PlannerSubHeader"
import CalendarViewFactory from "@/components/workspace/planner/views/CalendarViewFactory"
import PlannerInsightsPanel from "@/components/workspace/planner/PlannerInsightsPanel"
import PlannerSkeleton from "@/components/workspace/planner/PlannerSkeleton"
import MinimalPostCreatorModal from "@/components/workspace/planner/MinimalPostCreatorModal"
import GoogleDrivePickerModal from "@/components/workspace/planner/GoogleDrivePickerModal"

export default function ContentPlannerPage() {
  const { viewMode, currentDate, isLoading, posts, selectedPlatforms, fetchPlannerData, refreshMonth, getFilteredPosts } = useContentPlanner()
  const activeBrand = useBrandStore((state) => state.activeBrand)
  const { downloadFile } = useGoogleDrive(activeBrand?.id)

  const [postCreatorState, setPostCreatorState] = useState(null) // { isOpen: boolean, initialMedia, initialScheduledAt }
  // Panel Google Drive cố định cạnh lịch — khớp bản gốc PubliCast/frontend
  // WeeklyCalendarView.jsx (showSidebar toggle SidebarIntegrations).
  const [showDrivePanel, setShowDrivePanel] = useState(false)

  useEffect(() => {
    fetchPlannerData(activeBrand?.id)
  }, [fetchPlannerData, activeBrand?.id])

  const filteredPosts = useMemo(() => getFilteredPosts(), [posts, selectedPlatforms, getFilteredPosts])

  const handleDriveFileDrop = async (file, dateStr, hour) => {
    const scheduledDateIso = buildScheduledDate(dateStr, hour)
    const scheduledLabel = hour != null ? `${dateStr} lúc ${hour}:00` : dateStr

    toast.loading(`Đang tải "${file.name}" từ Google Drive...`, { id: "drive-download" })

    try {
      const downloadData = await downloadFile(file.id, file.name)
      toast.success(`Đã chuẩn bị tệp "${file.name}" cho ô ${scheduledLabel}!`, { id: "drive-download" })

      setPostCreatorState({
        isOpen: true,
        initialMedia: {
          url: downloadData?.videoUrl,
          name: file.name,
        },
        initialScheduledAt: scheduledDateIso,
      })
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Không tải được "${file.name}" từ Drive`,
        { id: "drive-download" }
      )
    }
  }

  const handleOpenNewPost = () => {
    setPostCreatorState({
      isOpen: true,
      initialMedia: null,
      initialScheduledAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden p-6 space-y-3 bg-muted/10">
      {isLoading ? (
        <PlannerSkeleton />
      ) : (
        <>
          {/* SubHeader: Date Navigation, View Mode, Platform Filters, Search */}
          <PlannerSubHeader
            onOpenNewPostModal={handleOpenNewPost}
            showDrivePanel={showDrivePanel}
            setShowDrivePanel={setShowDrivePanel}
          />

          {/* Main Content Area: Calendar Grid + Drive Panel (optional) + Insights Sidebar */}
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Left Calendar Grid (Primary Scroll Container) */}
            <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pr-1 rounded-2xl">
              <CalendarViewFactory
                viewMode={viewMode}
                posts={filteredPosts}
                currentDate={currentDate}
                onDriveFileDrop={handleDriveFileDrop}
              />
            </div>

            {/* Google Drive Panel — cạnh lịch, khớp SidebarIntegrations bản gốc */}
            {showDrivePanel && (
              <div className="w-[340px] shrink-0">
                <GoogleDrivePickerModal
                  isOpen={showDrivePanel}
                  onClose={() => setShowDrivePanel(false)}
                  variant="panel"
                />
              </div>
            )}

            {/* Right Insights Sidebar (Fixed / Non-overlapping Scroll) */}
            <PlannerInsightsPanel />
          </div>
        </>
      )}

      {/* Minimal Post Creator Modal for Drive Import & New Post */}
      {postCreatorState && (
        <MinimalPostCreatorModal
          isOpen={postCreatorState.isOpen}
          onClose={() => setPostCreatorState(null)}
          brandId={activeBrand?.id}
          initialMedia={postCreatorState.initialMedia}
          initialScheduledAt={postCreatorState.initialScheduledAt}
          onSuccess={() => refreshMonth(activeBrand?.id, currentDate)}
        />
      )}
    </div>
  )
}
