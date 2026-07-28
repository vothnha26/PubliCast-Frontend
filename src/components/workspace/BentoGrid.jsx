import React from "react"
import { useTranslation } from "react-i18next"
import { Sparkles, Zap, Radio, ChevronRight, Link2, Briefcase, TrendingUp, ArrowUpRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"

const MOCK_BENTO_DATA = {
  aiOptimization: "84%",
  aiTrend: "+5.2% vs last week",
  scheduledActivations: "1.2k",
  activationsTrend: "+14.8% vs last week",
  connections: [
    { id: "linkedin", nameKey: "bento.connections.linkedin", statusKey: "bento.connections.connected", icon: Link2, change: "+12%", positive: true },
    { id: "enterprise", nameKey: "bento.connections.enterprise", statusKey: "bento.connections.syncing", icon: Briefcase, change: "+5%", positive: false },
  ],
  engagementSeries: [
    { time: "00:00", value: 320 },
    { time: "04:00", value: 280 },
    { time: "08:00", value: 540 },
    { time: "12:00", value: 810 },
    { time: "16:00", value: 690 },
    { time: "20:00", value: 940 },
    { time: "23:59", value: 760 },
  ],
}

const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
        <p className="font-bold text-foreground">Time: {data.time}</p>
        <p className="text-[hsl(var(--sidebar-primary))] font-semibold mt-1">
          Engagement: {data.value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function BentoGrid() {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-12 grid-rows-[400px_220px] gap-4 select-none">
      {/* Live Engagement Velocity — main chart, top-left, spans 8 cols */}
      <div className="col-span-8 row-start-1 rounded-xl border bg-card p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.55px] text-muted-foreground">
            {t("bento.live_engagement")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--sidebar-accent))] px-2 py-1 text-[13px] text-[hsl(var(--sidebar-primary))]">
            <Radio className="h-2 w-2 fill-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))] animate-pulse" />
            {t("bento.live_now")}
          </span>
        </div>
        <div className="h-[calc(100%-4rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_BENTO_DATA.engagementSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--sidebar-primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--sidebar-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="6 6" className="stroke-muted/40" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                className="fill-foreground/80"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--sidebar-primary))"
                strokeWidth={2.5}
                fill="url(#engagementGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Optimization + Scheduled Activations — top-right, spans 4 cols, stacked */}
      <div className="col-span-4 row-start-1 flex flex-col gap-4">
        <div className="flex-1 rounded-xl bg-[hsl(var(--sidebar-primary))] p-6 flex flex-col justify-between text-white shadow-xs">
          <Sparkles className="h-6 w-6" />
          <div>
            <div className="text-2xl font-bold">{MOCK_BENTO_DATA.aiOptimization}</div>
            <p className="text-sm opacity-90 mt-1">{t("bento.ai_optimization")}</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-200 mt-2 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>{MOCK_BENTO_DATA.aiTrend}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-[hsl(var(--sidebar-accent))] border p-6 flex flex-col justify-between shadow-xs">
          <Zap className="h-5 w-5 text-foreground" />
          <div>
            <div className="text-2xl font-bold text-foreground">{MOCK_BENTO_DATA.scheduledActivations}</div>
            <p className="text-sm text-muted-foreground mt-1">{t("bento.scheduled_activations")}</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>{MOCK_BENTO_DATA.activationsTrend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Connections — bottom-left, spans 4 cols */}
      <div className="col-span-4 row-start-2 rounded-xl border bg-card p-[17px] flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-foreground">{t("bento.top_connections")}</h4>
          <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_BENTO_DATA.connections.map((conn) => {
            const Icon = conn.icon
            return (
              <div
                key={conn.id}
                className="flex items-center gap-4 p-1 rounded-lg transition-colors hover:bg-[hsl(var(--sidebar-accent)/0.5)]"
              >
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--sidebar-accent))] flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t(conn.nameKey)}</p>
                  <p className="text-[13px] text-muted-foreground">{t(conn.statusKey)}</p>
                </div>
                <span
                  className={`text-[11px] font-bold tracking-[0.55px] ${
                    conn.positive ? "text-[hsl(var(--sidebar-primary))]" : "text-amber-600"
                  }`}
                >
                  {conn.change}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Step CTA — bottom-right, spans 8 cols */}
      <div className="col-span-8 row-start-2 rounded-xl border bg-[hsl(var(--sidebar-accent))] p-[17px] flex flex-col justify-center overflow-hidden shadow-xs">
        <div className="max-w-md">
          <h4 className="text-xl font-semibold text-foreground mb-1">{t("bento.next_step_title")}</h4>
          <p className="text-sm text-muted-foreground mb-4">{t("bento.next_step_desc")}</p>
          <Button className="h-9 px-5 text-xs font-semibold rounded-lg bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)] text-white gap-2 shadow-xs">
            <span>{t("bento.launch_wizard")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
