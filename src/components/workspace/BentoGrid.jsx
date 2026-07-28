import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, Sparkles, Zap, Radio, ChevronRight } from "lucide-react"

export default function BentoGrid() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 select-none">
      {/* Live Stream Active Badge (Top Right Pill) */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{t("dashboard.live_stream_active")}</span>
        </div>
      </div>

      {/* Main Welcome State (Centered Layout) */}
      <div className="flex flex-col items-center justify-center text-center py-8 max-w-xl mx-auto space-y-6">
        {/* Soft Blue Icon Container */}
        <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("dashboard.welcome_title")}
          </h2>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t("dashboard.welcome_desc")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button className="h-10 px-5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>{t("dashboard.connect_data_source")}</span>
          </Button>

          <Button variant="outline" className="h-10 px-5 text-xs font-semibold rounded-lg bg-background shadow-2xs">
            {t("dashboard.view_documentation")}
          </Button>
        </div>
      </div>

      {/* Campaign Performance Bento Grid Canvas */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Campaign Performance</h3>
            <p className="text-xs text-muted-foreground">Real-time engagement orchestration</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8">
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Chart Card */}
          <Card className="md:col-span-2 p-5 bg-card border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Engagement Velocity
              </span>
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Now
              </span>
            </div>
            <div className="h-48 rounded-lg bg-slate-100 dark:bg-slate-900 border border-dashed flex items-center justify-center text-xs text-muted-foreground">
              [ Chart Graph Visualization ]
            </div>
          </Card>

          {/* AI Optimizer Card */}
          <Card className="p-5 bg-indigo-600 text-white border-none flex flex-col justify-between">
            <div className="space-y-1">
              <Sparkles className="h-6 w-6 text-indigo-200 mb-2" />
              <div className="text-2xl font-extrabold">84%</div>
              <p className="text-xs text-indigo-200 font-medium">AI Optimization Velocity Score</p>
            </div>
            <p className="text-[11px] text-indigo-100/80 mt-4">
              Your posts are optimized for maximum peak hours.
            </p>
          </Card>

          {/* Connections Card */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Top Connections</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900">
                <span className="font-semibold">LinkedIn Global</span>
                <span className="text-emerald-600 font-bold">+18%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900">
                <span className="font-semibold">Enterprise Portal</span>
                <span className="text-emerald-600 font-bold">+8%</span>
              </div>
            </div>
          </Card>

          {/* Next Step Banner Card */}
          <Card className="md:col-span-2 p-5 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-slate-50/50 dark:from-indigo-950/20 dark:to-slate-900/20 border-indigo-100 dark:border-indigo-900/50">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Next Step: Expand Reach
              </h4>
              <p className="text-xs text-muted-foreground">
                Your recent posts are performing 40% better than the industry average.
              </p>
            </div>
            <Button size="sm" variant="ghost" className="text-xs text-indigo-600 font-semibold gap-1">
              Launch Wizard <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
