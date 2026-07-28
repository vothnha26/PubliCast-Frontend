import React from "react"
import { useTranslation } from "react-i18next"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  HardDrive,
  FileSpreadsheet,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react"
import { useContentPlanner } from "@/store/useContentPlanner"

const MOCK_BEST_TIMES = [
  { hour: "12am", score: 25 },
  { hour: "4am", score: 40 },
  { hour: "8am", score: 85 },
  { hour: "12pm", score: 100 },
  { hour: "4pm", score: 75 },
  { hour: "8pm", score: 90 },
  { hour: "11pm", score: 35 },
]

export default function PlannerInsightsPanel() {
  const { t } = useTranslation()
  const { isInsightsOpen, toggleInsights } = useContentPlanner()

  if (!isInsightsOpen) {
    return (
      <div className="w-12 border-l border-border bg-card flex flex-col items-center py-3.5 gap-4 shrink-0 transition-all duration-300 select-none">
        {/* Toggle Button using PanelRightOpen icon matching user request */}
        <button
          onClick={toggleInsights}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title="Mở rộng Planner Insights"
        >
          <PanelRightOpen className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
        </button>

        <span
          onClick={toggleInsights}
          className="text-[10px] font-extrabold text-muted-foreground tracking-widest [writing-mode:vertical-lr] rotate-180 opacity-70 hover:opacity-100 cursor-pointer mt-2"
        >
          INSIGHTS & BÁO CÁO
        </span>
      </div>
    )
  }

  return (
    <aside className="w-80 flex flex-col gap-5 border-l border-border bg-card p-5 shrink-0 overflow-y-auto transition-all duration-300 select-none">
      {/* Header with PanelRightClose Toggle Button on Left */}
      <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
        <button
          onClick={toggleInsights}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
          title="Thu gọn Planner Insights"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <div>
          <h3 className="text-sm font-extrabold tracking-tight text-foreground">{t("planner.insights.title")}</h3>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{t("planner.insights.subtitle")}</p>
        </div>
      </div>

      {/* 1. Best Times to Post (Recharts Bar Chart) */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-background/50 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("planner.insights.best_times")}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-foreground cursor-pointer border rounded-md px-2 py-0.5 bg-card">
            <span>Instagram</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        <div className="h-28 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_BEST_TIMES} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 6,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--sidebar-primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-muted-foreground italic text-center pt-1 border-t border-border/60">
          {t("planner.labels.peak_engagement")}
        </p>
      </div>

      {/* 2. This Month Stats */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          {t("planner.insights.month_stats")}
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-background/50 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("planner.insights.total_posts")}</span>
            <div className="text-2xl font-black text-[hsl(var(--sidebar-primary))] mt-1">124</div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("planner.insights.scheduled")}</span>
            <div className="text-2xl font-black text-amber-500 mt-1">32</div>
          </div>
        </div>
      </div>

      {/* 3. Integrations */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-background/50 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          {t("planner.insights.integrations")}
        </span>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold text-foreground">Google Drive</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-foreground">CSV Import</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 mt-2 bg-card">
          <Plus className="h-3.5 w-3.5" />
          <span>{t("planner.actions.add_integration")}</span>
        </Button>
      </div>

      {/* 4. AI Insights Banner */}
      <div className="rounded-xl bg-slate-900 dark:bg-slate-950 text-white p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <Sparkles className="h-4 w-4" />
          <span>{t("planner.insights.ai_title")}</span>
        </div>
        <p className="text-xs opacity-85 leading-relaxed">
          {t("planner.insights.ai_desc")}
        </p>
        <Button className="w-full text-xs h-8 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
          {t("planner.insights.view_suggestions")}
        </Button>
      </div>

      {/* 5. Bottom Export Report Button */}
      <Button variant="outline" className="w-full h-10 text-xs font-semibold text-foreground border-border bg-card mt-auto shadow-2xs">
        {t("planner.actions.export_report")}
      </Button>
    </aside>
  )
}
