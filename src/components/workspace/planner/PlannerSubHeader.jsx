import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM } from "@/constants/planner"
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
} from "lucide-react"

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
    searchQuery,
    setSearchQuery,
  } = useContentPlanner()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
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
  const activeFiltersCount = totalPlatforms - selectedPlatforms.length

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
    <div className="space-y-3 pb-3 border-b border-border select-none">
      {/* 3-Column Grid Layout: Pinned Exact Center View Switcher (0 Layout Shift!) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Column 1 (Left): Unified Date Navigation & Clickable Date Picker Popover */}
        <div className="flex items-center gap-3 justify-start relative">
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
              onClick={() => {
                setPickerYear(currentDate.getFullYear())
                setIsDatePickerOpen(!isDatePickerOpen)
              }}
              className="px-2.5 py-1 text-xs font-bold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-x border-border/60 flex items-center gap-1.5"
              title="Click để chọn lịch cụ thể"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-[hsl(var(--sidebar-primary))]" />
              <span>{t("planner.actions.today")}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Interactive Date Range Title */}
          <button
            onClick={() => {
              setPickerYear(currentDate.getFullYear())
              setIsDatePickerOpen(!isDatePickerOpen)
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-border hover:bg-card text-foreground transition-all group"
            title="Lọc / Chọn lịch cụ thể"
          >
            <span className="text-base font-extrabold tracking-tight">{formattedDateRange}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
          </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <>
              {/* Backdrop overlay to close when clicking outside */}
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

        {/* Column 2 (Center): Segmented View Mode Switcher (Pinned Exact Center) */}
        <div className="flex items-center justify-center">
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
            {viewOptions.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setViewMode(opt.mode)}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
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

        {/* Column 3 (Right): Search + Filter Popover + Primary CTA */}
        <div className="flex items-center gap-2.5 justify-end relative">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={t("planner.search_placeholder")}
              className="h-9 w-36 sm:w-44 pl-8 pr-3 text-xs bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-primary))] transition-all"
            />
          </div>

          {/* Filter Popover Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-9 px-3 text-xs font-semibold gap-1.5 border-border shadow-2xs bg-card ${
                activeFiltersCount > 0 ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]" : ""
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{t("planner.actions.filters")}</span>
              {activeFiltersCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-[hsl(var(--sidebar-primary))] text-white text-[10px] font-bold flex items-center justify-center -mr-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-11 w-64 p-3 rounded-2xl bg-card border border-border shadow-xl space-y-3 z-50 animate-scale-in">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t("planner.actions.filters")}
                  </span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Platform Checkboxes */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    {t("planner.labels.platform_label")}
                  </span>
                  {Object.values(SOCIAL_PLATFORM).map((platform) => {
                    const isChecked = selectedPlatforms.includes(platform.id)
                    return (
                      <label
                        key={platform.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={platform.iconName} size={14} />
                          <span className="font-medium text-foreground">{platform.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePlatform(platform.id)}
                          className="h-3.5 w-3.5 rounded border-border accent-[hsl(var(--sidebar-primary))]"
                        />
                      </label>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={selectAllPlatforms}
                    className="text-[11px] font-bold text-indigo-500 hover:underline"
                  >
                    {t("planner.actions.clear_all")}
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="h-7 px-3 text-[11px] font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-md"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <Button className="h-9 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-2 shadow-xs shrink-0">
            <Plus className="h-4 w-4" />
            <span>{t("planner.actions.create_post")}</span>
          </Button>
        </div>
      </div>

      {/* Platform Filter Pills with Sleek & Modern Aesthetic */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
          {t("planner.labels.platforms")}
        </span>
        {Object.values(SOCIAL_PLATFORM).map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                isSelected
                  ? "bg-card border-slate-300 dark:border-slate-700 text-foreground shadow-2xs ring-1 ring-slate-400/20"
                  : "bg-slate-100/60 dark:bg-slate-800/40 border-transparent text-muted-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-foreground"
              }`}
            >
              <PlatformIcon
                platform={platform.iconName}
                size={15}
                className={isSelected ? "shrink-0" : "shrink-0 opacity-40 grayscale transition-opacity"}
              />
              <span>{platform.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
