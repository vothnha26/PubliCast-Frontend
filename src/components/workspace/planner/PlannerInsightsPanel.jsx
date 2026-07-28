import React, { useMemo, useState, useEffect, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { useContentPlanner } from "@/store/useContentPlanner"
import { useBrandStore } from "@/store/useBrandStore"
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { DRIVE_STATUS } from "@/constants/googleDrive"
import { BEST_TIMES_SUPPORTED_PLATFORMS } from "@/constants/post"
import { plannerService } from "@/services/plannerService"

export default function PlannerInsightsPanel() {
  const { t } = useTranslation()
  const { isInsightsOpen, toggleInsights, posts, currentDate } = useContentPlanner()

  // posts hiện được fetch qua GET /posts?limit=100 KHÔNG lọc theo tháng
  // (plannerService.js) — lọc lại ở đây theo tháng của currentDate đang xem,
  // để "Thống kê tháng này" đúng nghĩa "tháng đang xem trên lịch", không phải
  // toàn bộ 100 post gần nhất.
  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const postsThisMonth = posts.filter((p) => {
      if (!p.date) return false
      const d = new Date(p.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    return {
      total: postsThisMonth.length,
      scheduled: postsThisMonth.filter((p) => p.status === "SCHEDULED").length,
    }
  }, [posts, currentDate])
  const activeBrand = useBrandStore((state) => state.activeBrand)
  const { status: driveStatus, fetchFiles: fetchDriveFiles } = useGoogleDrive(activeBrand?.id)

  React.useEffect(() => {
    if (activeBrand?.id) fetchDriveFiles()
  }, [activeBrand?.id, fetchDriveFiles])

  const isDriveConnected = driveStatus === DRIVE_STATUS.CONNECTED

  const [bestTimesPlatform, setBestTimesPlatform] = useState(BEST_TIMES_SUPPORTED_PLATFORMS[0])
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false)
  const [bestTimesData, setBestTimesData] = useState([])
  const [isBestTimesLoading, setIsBestTimesLoading] = useState(false)

  const fetchBestTimes = useCallback(async () => {
    if (!activeBrand?.id) return
    setIsBestTimesLoading(true)
    try {
      const data = await plannerService.getBestTimes(activeBrand.id, bestTimesPlatform)
      setBestTimesData(data)
    } catch {
      setBestTimesData([])
    } finally {
      setIsBestTimesLoading(false)
    }
  }, [activeBrand?.id, bestTimesPlatform])

  useEffect(() => {
    fetchBestTimes()
  }, [fetchBestTimes])

  if (!isInsightsOpen) {
    return (
      <div className="w-12 border-l border-border bg-card flex flex-col items-center py-3.5 gap-4 shrink-0 transition-all duration-300">
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
          {t("planner.labels.panel_title")}
        </span>
      </div>
    )
  }

  return (
    <aside className="w-80 flex flex-col gap-5 border-l border-border bg-card p-5 shrink-0 overflow-y-auto transition-all duration-300">
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
          <div className="relative">
            <button
              onClick={() => setIsPlatformMenuOpen((open) => !open)}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground cursor-pointer border rounded-lg px-3 py-1.5 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="capitalize">{bestTimesPlatform.toLowerCase()}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {isPlatformMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPlatformMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-card shadow-lg z-50 py-1">
                  {BEST_TIMES_SUPPORTED_PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setBestTimesPlatform(platform)
                        setIsPlatformMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm capitalize hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        platform === bestTimesPlatform ? "font-bold text-[hsl(var(--sidebar-primary))]" : "text-foreground"
                      }`}
                    >
                      {platform.toLowerCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-28 w-full pt-2">
          {isBestTimesLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : bestTimesData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground">
              Chưa có đủ dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestTimesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
          )}
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
            <div className="text-2xl font-black text-[hsl(var(--sidebar-primary))] mt-1">{monthStats.total}</div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("planner.insights.scheduled")}</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{monthStats.scheduled}</div>
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
            <span
              className={`h-2 w-2 rounded-full ${isDriveConnected ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
              title={isDriveConnected ? "Đã kết nối" : "Chưa kết nối"}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-foreground">CSV Import</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
        {/* Nút "Thêm kết nối" đã bỏ khỏi đây — dùng nút "Google Drive" trên
            toolbar chính (PlannerSubHeader.jsx) làm CỔNG DUY NHẤT để mở
            GoogleDrivePickerModal, tránh 2 nơi cùng làm 1 việc (đã có 4 nơi
            trước khi dọn: toolbar, panel này, ImportSyncModal, Media Hub mock). */}
      </div>

      {/* 4. AI Insights Banner — chưa có API backend tương ứng (đã khảo sát
          backend/src/routes/workspace/ai.routes.js: chỉ có content generation,
          không có endpoint phân tích/insight). Gắn nhãn "Sắp ra mắt", vô hiệu
          hoá tương tác thay vì hiện dữ liệu giả. */}
      <div className="relative rounded-xl bg-slate-900 dark:bg-slate-950 text-white p-4 space-y-3 shadow-md opacity-60">
        <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full">
          {t("planner.insights.coming_soon")}
        </span>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <Sparkles className="h-4 w-4" />
          <span>{t("planner.insights.ai_title")}</span>
        </div>
        <p className="text-xs opacity-85 leading-relaxed">
          {t("planner.insights.ai_desc")}
        </p>
        <Button disabled className="w-full text-xs h-8 font-semibold bg-indigo-600 text-white cursor-not-allowed">
          {t("planner.insights.view_suggestions")}
        </Button>
      </div>

      {/* 5. Bottom Export Report Button — module Reports thật đã tồn tại ở
          backend (/api/reports, xem khảo sát) nhưng lớn hơn nhiều so với 1 nút
          đơn giản (preview, gửi email, lịch tự động...) — cần bàn UX riêng
          trước khi nối, tạm gắn nhãn "Sắp ra mắt" thay vì nối API vội. */}
      <Button
        disabled
        variant="outline"
        className="w-full h-10 text-xs font-semibold text-muted-foreground border-border bg-card mt-auto shadow-2xs cursor-not-allowed gap-1.5"
      >
        <span>{t("planner.actions.export_report")}</span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
          {t("planner.insights.coming_soon")}
        </span>
      </Button>
    </aside>
  )
}
