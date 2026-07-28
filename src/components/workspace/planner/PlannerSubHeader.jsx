import React from "react"
import { useTranslation } from "react-i18next"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM } from "@/constants/planner"
import { useContentPlanner } from "@/store/useContentPlanner"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus, Check } from "lucide-react"

export default function PlannerSubHeader() {
  const { t } = useTranslation()
  const {
    viewMode,
    setViewMode,
    currentDate,
    navigateDate,
    selectedPlatforms,
    togglePlatform,
    selectAllPlatforms,
  } = useContentPlanner()

  // Format date range
  const formattedDateRange = "Nov 18 – Nov 24, 2026"

  const viewOptions = [
    { mode: CALENDAR_VIEW_MODE.MONTH, labelKey: "planner.view.month" },
    { mode: CALENDAR_VIEW_MODE.WEEK_HOURLY, labelKey: "planner.view.week" },
    { mode: CALENDAR_VIEW_MODE.DAY, labelKey: "planner.view.day" },
    { mode: CALENDAR_VIEW_MODE.LIST, labelKey: "planner.view.list" },
  ]

  return (
    <div className="space-y-4 pb-4 border-b border-border select-none">
      {/* Top Header Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Date Navigation Group */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            <span>{formattedDateRange}</span>
          </h2>

          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
            <button
              onClick={() => navigateDate("prev")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateDate("today")}
              className="px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-x border-border/60"
            >
              {t("planner.actions.today")}
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
          {viewOptions.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => setViewMode(opt.mode)}
              className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                viewMode === opt.mode
                  ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>

        {/* Actions: Filter + New Post */}
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold gap-2 border-border shadow-2xs">
            <Filter className="h-3.5 w-3.5" />
            <span>{t("planner.actions.filters")}</span>
          </Button>

          <Button className="h-9 px-4 text-xs font-semibold rounded-lg bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>{t("planner.actions.create_post")}</span>
          </Button>
        </div>
      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
          PLATFORMS:
        </span>
        {Object.values(SOCIAL_PLATFORM).map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                isSelected
                  ? `${platform.badgeClass} ring-1 ring-current font-bold`
                  : "bg-card border-border text-muted-foreground hover:text-foreground opacity-60"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${platform.dotClass}`} />
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
