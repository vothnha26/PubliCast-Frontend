import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM, POST_STATUS, POST_TYPE, FILTER_ALL } from "@/constants/planner"
import { useContentPlanner } from "@/store/useContentPlanner"
import { formatDateRange } from "@/utils/dateUtils"
import { Button } from "@/components/ui/button"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Globe,
  Settings,
  RefreshCw,
  HardDrive,
} from "lucide-react"

import { toast } from "sonner"
import ImportSyncModal from "./ImportSyncModal"

export default function PlannerSubHeader({ onOpenNewPostModal, showDrivePanel, setShowDrivePanel }) {
  const { t } = useTranslation()
  const [plannerTab, setPlannerTab] = useState("calendar")
  const {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    navigateDate,
    selectedPlatforms,
    togglePlatform,
    selectAllPlatforms,
    selectedStatuses,
    toggleStatus,
    selectAllStatuses,
    selectedTypes,
    toggleType,
    selectAllTypes,
    resetAllFilters,
    searchQuery,
    setSearchQuery,
    isInsightsOpen,
    toggleInsights,
  } = useContentPlanner()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false)
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())

  const PLANNER_SUB_TABS = [
    { id: "calendar", label: t("planner.sub_tabs.calendar") },
    { id: "list", label: t("planner.sub_tabs.list") },
    { id: "library", label: t("planner.sub_tabs.library"), isDiamond: true },
    { id: "autolists", label: t("planner.sub_tabs.autolists") },
    { id: "deleted", label: t("planner.sub_tabs.deleted") },
  ]

  // Dynamic date range format using i18n
  const formattedDateRange = formatDateRange(currentDate, viewMode, t)

  const viewOptions = [
    { mode: CALENDAR_VIEW_MODE.MONTH, labelKey: "planner.view.month" },
    { mode: CALENDAR_VIEW_MODE.WEEK_HOURLY, labelKey: "planner.view.week" },
    { mode: CALENDAR_VIEW_MODE.DAY, labelKey: "planner.view.day" },
    { mode: CALENDAR_VIEW_MODE.LIST, labelKey: "planner.view.list" },
  ]

  const totalPlatforms = Object.keys(SOCIAL_PLATFORM).length
  const totalStatuses = Object.keys(POST_STATUS).length
  const totalTypes = Object.keys(POST_TYPE).length

  const activeFiltersCount =
    (totalPlatforms - (selectedPlatforms?.length || totalPlatforms)) +
    (totalStatuses - (selectedStatuses?.length || totalStatuses)) +
    (totalTypes - (selectedTypes?.length || totalTypes))

  const monthKeys = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  const handleSelectMonth = (monthIndex) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(pickerYear)
    newDate.setMonth(monthIndex)
    newDate.setDate(1)
    setCurrentDate(newDate)
    setIsDatePickerOpen(false)
  }

  return (
    <div className="pb-3 border-b border-border space-y-3">
      {/* 0. TOP SUB-NAV BAR (Auto-Scaling Sub-navigation Tabs) */}
      <div className="border-b border-border/40 pb-1 px-1 text-sm w-full">
        <div className="flex items-center justify-between w-full overflow-x-auto no-scrollbar gap-2">
          {PLANNER_SUB_TABS.map((tab) => {
            const isActive = plannerTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setPlannerTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 font-bold relative pb-2.5 transition-all flex-1 text-center whitespace-nowrap min-w-max px-3 ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                }`}
              >
                <span>{tab.label}</span>
                {tab.isDiamond && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-lime-300 dark:bg-lime-900 text-[10px]">
                    💎
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full animate-scale-in" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 1. MAIN PLANNER TOOLBAR (Date Controls, View Switcher, Search, Filters, Actions) */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
        {/* Group 1 (Left): Date Navigation + Date Title + Platform Filter */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Navigation Pill Group */}
          <div className="flex items-center rounded-xl border border-border bg-card p-0.5 shadow-2xs shrink-0">
            <button
              onClick={() => navigateDate("prev")}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateDate("today")}
              className="px-2.5 py-1 text-xs font-bold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-x border-border/60"
              title="Nhảy về Hôm nay"
            >
              {t("planner.actions.today")}
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Date Range Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setPickerYear(currentDate.getFullYear())
                setIsDatePickerOpen(!isDatePickerOpen)
                setIsPlatformDropdownOpen(false)
                setIsFilterOpen(false)
                setIsCalendarSettingsOpen(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground transition-all shadow-2xs group"
            >
              <CalendarIcon className="h-4 w-4 text-[hsl(var(--sidebar-primary))] shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight whitespace-nowrap">{formattedDateRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
            </button>

            {/* Date Picker Popover */}
            {isDatePickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsDatePickerOpen(false)}
                />

                <div className="absolute left-0 top-full mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 z-50 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-[hsl(var(--sidebar-primary))]" />
                      <span>Chọn thời gian lịch</span>
                    </span>
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Year Selector */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <button
                      onClick={() => setPickerYear((y) => y - 1)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-extrabold text-foreground">{pickerYear}</span>
                    <button
                      onClick={() => setPickerYear((y) => y + 1)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Month Selector Grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {monthKeys.map((mKey, idx) => {
                      const isCurrentSelected =
                        currentDate.getFullYear() === pickerYear && currentDate.getMonth() === idx
                      return (
                        <button
                          key={mKey}
                          onClick={() => handleSelectMonth(idx)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            isCurrentSelected
                              ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-xs"
                              : "bg-slate-100/70 dark:bg-slate-800/50 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {t(`planner.months.${mKey}`)}
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentDate(new Date())
                        setIsDatePickerOpen(false)
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--sidebar-primary))] hover:underline"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{t("planner.actions.today")}</span>
                    </button>
                    <span className="text-[10px] text-muted-foreground">Click chọn thời gian</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Platform Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPlatformDropdownOpen(!isPlatformDropdownOpen)
                setIsDatePickerOpen(false)
                setIsFilterOpen(false)
                setIsCalendarSettingsOpen(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground transition-all shadow-2xs font-semibold text-xs shrink-0"
            >
              {selectedPlatforms.length === totalPlatforms ? (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
                  <span className="font-bold whitespace-nowrap">Tất cả nền tảng</span>
                </span>
              ) : selectedPlatforms.length === 1 ? (
                <span className="flex items-center gap-1.5">
                  <PlatformIcon platform={SOCIAL_PLATFORM[selectedPlatforms[0]]?.iconName} size={16} />
                  <span className="font-bold whitespace-nowrap">{SOCIAL_PLATFORM[selectedPlatforms[0]]?.name}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
                  <span className="font-bold whitespace-nowrap">Nền tảng ({selectedPlatforms.length}/{totalPlatforms})</span>
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
            </button>

            {/* Platform Selection Popover */}
            {isPlatformDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsPlatformDropdownOpen(false)}
                />

                <div className="absolute left-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2.5 z-50 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      SELECT PLATFORMS
                    </span>
                    <button
                      onClick={selectAllPlatforms}
                      className="text-[10px] font-bold text-indigo-500 hover:underline"
                    >
                      {t("planner.actions.select_all")}
                    </button>
                  </div>

                  <div className="space-y-1">
                    {Object.values(SOCIAL_PLATFORM).map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform.id)
                      return (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-slate-100/80 dark:bg-slate-800/80 text-foreground"
                              : "text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <PlatformIcon platform={platform.iconName} size={18} />
                            <span>{platform.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-emerald-500 font-bold shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group 2 (Center): Segmented View Mode Switcher */}
        <div className="flex items-center justify-center shrink-0">
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
            {viewOptions.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setViewMode(opt.mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                  viewMode === opt.mode
                    ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Group 3 (Right): Search + Filter + Settings + Integrations Black Icon Button + Create Post */}
        <div className="flex items-center gap-2 justify-end relative shrink-0">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={t("planner.search_placeholder")}
              className="h-9 w-28 sm:w-36 pl-8 pr-3 text-xs bg-card border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-primary))] transition-all"
            />
          </div>

          {/* Filter Popover Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen)
                setIsPlatformDropdownOpen(false)
                setIsDatePickerOpen(false)
                setIsCalendarSettingsOpen(false)
              }}
              className={`h-9 px-3 text-xs font-semibold gap-1.5 border-border shadow-2xs bg-card rounded-xl ${
                activeFiltersCount > 0 ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]" : ""
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("planner.actions.filters")}</span>
              {activeFiltersCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-[hsl(var(--sidebar-primary))] text-white text-[10px] font-bold flex items-center justify-center -mr-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsFilterOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5 z-50 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {t("planner.actions.filters")}
                    </span>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Status filter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("planner.labels.status_label")}
                      </span>
                      <button
                        onClick={selectAllStatuses}
                        className="text-[10px] font-bold text-indigo-500 hover:underline"
                      >
                        {t("planner.actions.select_all")}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.values(POST_STATUS).map((status) => {
                        const isChecked = selectedStatuses.includes(status.id)
                        return (
                          <button
                            key={status.id}
                            onClick={() => toggleStatus(status.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                              isChecked
                                ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-xs"
                                : "bg-slate-100/70 dark:bg-slate-800/50 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span className="truncate">{t(status.labelKey)}</span>
                            {isChecked && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Type filter */}
                  <div className="space-y-1.5 pt-2.5 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("planner.labels.type_label")}
                      </span>
                      <button
                        onClick={selectAllTypes}
                        className="text-[10px] font-bold text-indigo-500 hover:underline"
                      >
                        {t("planner.actions.select_all")}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.values(POST_TYPE).map((type) => {
                        const isChecked = selectedTypes.includes(type.id)
                        return (
                          <button
                            key={type.id}
                            onClick={() => toggleType(type.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                              isChecked
                                ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-xs"
                                : "bg-slate-100/70 dark:bg-slate-800/50 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span className="truncate">{t(type.labelKey)}</span>
                            {isChecked && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <button
                      onClick={resetAllFilters}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      {t("planner.actions.clear_all")}
                    </button>
                    <Button
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="h-7 px-3.5 text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-lg shadow-xs"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Menu Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCalendarSettingsOpen(!isCalendarSettingsOpen)
                setIsPlatformDropdownOpen(false)
                setIsDatePickerOpen(false)
                setIsFilterOpen(false)
              }}
              className="h-9 px-2.5 border-border shadow-2xs bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground rounded-xl"
              title={t("planner.settings.title")}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {isCalendarSettingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsCalendarSettingsOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-64 py-2 px-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-0.5 z-50 animate-scale-in text-xs">
                  <button
                    onClick={() => {
                      setIsCalendarSettingsOpen(false)
                      setIsImportModalOpen(true)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground">
                      <RefreshCw className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="text-foreground font-bold">{t("planner.settings.import_export")}</span>
                    </div>
                  </button>

                </div>
              </>
            )}
          </div>

          {/* Media/Photo Button — khớp bản gốc PubliCast/frontend
              PlannerToolbar.jsx:514-524 (nút icon vuông đen, toggle
              SidebarIntegrations panel cạnh lịch). Đây là CỔNG DUY NHẤT vào
              Google Drive, không lặp lại ở đâu khác trong Planner. */}
          <button
            onClick={() => setShowDrivePanel((prev) => !prev)}
            title="Google Drive & Media"
            className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 border ${
              showDrivePanel
                ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <HardDrive className="h-4 w-4" />
          </button>

          {/* Primary CTA */}
          <Button
            onClick={() => {
              if (typeof onOpenNewPostModal === "function") {
                onOpenNewPostModal()
              } else {
                toast.info("Mở trình tạo bài viết mới")
              }
            }}
            className="h-9 px-3.5 text-xs font-bold rounded-xl bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">{t("planner.actions.create_post")}</span>
          </Button>
        </div>
      </div>

      {/* Interactive Import / Export / Sync Modal */}
      <ImportSyncModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}

