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
  ZoomIn,
  Layers,
  RefreshCw,
  Grid,
  Bell,
  HardDrive,
  ImageIcon,
  Sparkles,
  Lightbulb,
  BarChart2,
} from "lucide-react"

import ImportSyncModal from "./ImportSyncModal"
import GoogleDrivePickerModal from "./GoogleDrivePickerModal"

export default function PlannerSubHeader() {
  const { t } = useTranslation()
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
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false)
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false)
  const [activeIntegrationTab, setActiveIntegrationTab] = useState("drive")
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())

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
    <div className="pb-3 border-b border-border">
      {/* Single Line Clean Toolbar Layout */}
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
                setIsIntegrationsOpen(false)
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
                setIsIntegrationsOpen(false)
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
                setIsIntegrationsOpen(false)
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

          {/* Insights Panel Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleInsights}
            className={`h-9 px-2.5 border-border shadow-2xs rounded-xl transition-all ${
              isInsightsOpen
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold"
                : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
            }`}
            title={isInsightsOpen ? "Ẩn Planner Insights" : "Hiện Planner Insights"}
          >
            <BarChart2 className="h-4 w-4" />
          </Button>

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
                setIsIntegrationsOpen(false)
              }}
              className="h-9 px-2.5 border-border shadow-2xs bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground rounded-xl"
              title="Cài đặt lịch"
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
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <ZoomIn className="h-4 w-4" />
                      <span className="text-foreground">Calendar zoom</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-foreground">Calendar view</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Layers className="h-4 w-4" />
                      <span className="text-foreground">Social calendars</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <div className="my-1 border-t border-border/60" />

                  <button
                    onClick={() => {
                      setIsCalendarSettingsOpen(false)
                      setIsImportModalOpen(true)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground">
                      <RefreshCw className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="text-foreground font-bold">Quản lý & Xuất nhập Dữ liệu</span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-border/60" />

                  <button
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Grid className="h-4 w-4" />
                      <span className="text-foreground">Preview feed</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Bell className="h-4 w-4" />
                      <span className="text-foreground">Notifications</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* SLEEK BLACK ICON BUTTON 🖼️ (Integrations Popover - Drive / Canva / Ideas) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsIntegrationsOpen(!isIntegrationsOpen)
                setIsCalendarSettingsOpen(false)
                setIsPlatformDropdownOpen(false)
                setIsDatePickerOpen(false)
                setIsFilterOpen(false)
              }}
              className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Media Hub & Integrations (Google Drive, Canva, Ideas)"
            >
              <ImageIcon className="h-4 w-4 text-white" />
            </button>

            {/* INTEGRATIONS POPOVER (Matching Image 1 EXACTLY) */}
            {isIntegrationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsIntegrationsOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-80 sm:w-84 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden z-50 animate-scale-in text-left">
                  {/* Top Header Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 h-12 px-4 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-6 h-full">
                      {/* Tab 1: Google Drive */}
                      <button
                        onClick={() => setActiveIntegrationTab("drive")}
                        className={`h-full flex items-center gap-1.5 relative px-1 transition-all ${
                          activeIntegrationTab === "drive" ? "opacity-100" : "opacity-40 hover:opacity-75"
                        }`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path d="M19.43 12.98L12 21.36L4.57 12.98L6.87 9.17H17.13L19.43 12.98Z" fill="#4CAF50" />
                          <path d="M15.43 2H8.57L5.13 7.82H18.87L15.43 2Z" fill="#FFC107" />
                          <path d="M2.14 7.82L5.57 13.64L2.14 19.45L2.14 7.82Z" fill="#2196F3" />
                        </svg>
                        {activeIntegrationTab === "drive" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
                        )}
                      </button>

                      {/* Tab 2: Canva */}
                      <button
                        onClick={() => setActiveIntegrationTab("canva")}
                        className={`h-full flex items-center gap-1.5 relative px-1 transition-all ${
                          activeIntegrationTab === "canva" ? "opacity-100" : "opacity-40 hover:opacity-75"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-[#00C4CC] text-white font-extrabold text-[10px] flex items-center justify-center shadow-2xs">
                          C
                        </div>
                        {activeIntegrationTab === "canva" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
                        )}
                      </button>

                      {/* Tab 3: Ideas */}
                      <button
                        onClick={() => setActiveIntegrationTab("ideas")}
                        className={`h-full flex items-center gap-1.5 relative px-1 transition-all ${
                          activeIntegrationTab === "ideas" ? "opacity-100" : "opacity-40 hover:opacity-75"
                        }`}
                      >
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        {activeIntegrationTab === "ideas" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => setIsIntegrationsOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tab Body Contents */}
                  <div className="p-6 text-center">
                    {activeIntegrationTab === "drive" && (
                      <div className="space-y-5 animate-fade-in">
                        {/* Sub Header Badge */}
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M19.43 12.98L12 21.36L4.57 12.98L6.87 9.17H17.13L19.43 12.98Z" fill="#4CAF50" />
                            <path d="M15.43 2H8.57L5.13 7.82H18.87L15.43 2Z" fill="#FFC107" />
                            <path d="M2.14 7.82L5.57 13.64L2.14 19.45L2.14 7.82Z" fill="#2196F3" />
                          </svg>
                          <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                            BETA
                          </span>
                        </div>

                        {/* Large Circle Illustration */}
                        <div className="w-24 h-24 mx-auto rounded-full bg-blue-50/70 dark:bg-slate-800/80 flex items-center justify-center shadow-inner">
                          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                            <path d="M19.43 12.98L12 21.36L4.57 12.98L6.87 9.17H17.13L19.43 12.98Z" fill="#4CAF50" />
                            <path d="M15.43 2H8.57L5.13 7.82H18.87L15.43 2Z" fill="#FFC107" />
                            <path d="M2.14 7.82L5.57 13.64L2.14 19.45L2.14 7.82Z" fill="#2196F3" />
                          </svg>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                            CONNECT GOOGLE DRIVE
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-[220px] mx-auto leading-relaxed">
                            Upgrade to a Premium plan and create your content using Google Drive!
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => {
                            setIsIntegrationsOpen(false)
                            setIsDrivePickerOpen(true)
                          }}
                          className="w-full py-2.5 px-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-95 text-white font-black text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          <span>Get premium</span>
                          <span>💎</span>
                        </button>
                      </div>
                    )}

                    {activeIntegrationTab === "canva" && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#00C4CC] text-white font-extrabold text-[10px] flex items-center justify-center">
                            C
                          </div>
                          <span className="text-[10px] font-extrabold bg-[#00C4CC] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                            CANVA
                          </span>
                        </div>

                        <div className="w-24 h-24 mx-auto rounded-full bg-teal-50 dark:bg-slate-800/80 flex items-center justify-center shadow-inner">
                          <div className="w-14 h-14 rounded-full bg-[#00C4CC] text-white font-black text-2xl flex items-center justify-center shadow-md">
                            C
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                            CONNECT CANVA
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-[220px] mx-auto leading-relaxed">
                            Design and import beautiful social graphics directly from your Canva workspace!
                          </p>
                        </div>

                        <button
                          onClick={() => setIsIntegrationsOpen(false)}
                          className="w-full py-2.5 px-6 rounded-full bg-[#00C4CC] hover:bg-[#00b2b9] text-white font-black text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          <span>Get premium</span>
                          <span>💎</span>
                        </button>
                      </div>
                    )}

                    {activeIntegrationTab === "ideas" && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-center gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-500" />
                          <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                            AI IDEAS
                          </span>
                        </div>

                        <div className="w-24 h-24 mx-auto rounded-full bg-amber-50 dark:bg-slate-800/80 flex items-center justify-center shadow-inner">
                          <Sparkles className="w-12 h-12 text-amber-500" />
                        </div>

                        <div>
                          <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                            CONTENT ASSISTANT
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-[220px] mx-auto leading-relaxed">
                            Never run out of creative post ideas with AI-powered content recommendations!
                          </p>
                        </div>

                        <button
                          onClick={() => setIsIntegrationsOpen(false)}
                          className="w-full py-2.5 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          <span>Explore Ideas</span>
                          <span>✨</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary CTA */}
          <Button className="h-9 px-3.5 text-xs font-bold rounded-xl bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-1.5 shadow-xs shrink-0">
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

      {/* Direct Google Drive Picker Modal */}
      <GoogleDrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
      />
    </div>
  )
}

