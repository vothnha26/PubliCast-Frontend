import React from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { SIDEBAR_NAV_GROUPS } from "@/constants/navigation"
import { THEME_MODE } from "@/constants/theme"
import { useThemeStore } from "@/store/useThemeStore"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Settings, HelpCircle, LogOut } from "lucide-react"

export default function Sidebar() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const openSettings = useDashboardStore((state) => state.openSettings)

  return (
    <aside className="w-56 flex flex-col h-screen border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))] shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
          </svg>
        </div>
        <span className="font-bold text-base tracking-tight text-indigo-600 dark:text-indigo-400">
          {t("header.brand")}
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        {SIDEBAR_NAV_GROUPS.map((group) => (
          <div key={group.id} className="space-y-1.5">
            <h4 className="px-3 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {t(group.titleKey)}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[hsl(var(--sidebar-accent))] text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{t(item.labelKey)}</span>
                    </div>
                    {item.activeDot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan Card */}
      <div className="p-3">
        <div className="rounded-xl border bg-background/60 p-3 shadow-xs border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {t("plan.hub_title")}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[11px] text-muted-foreground mb-2.5">{t("plan.enterprise_plan")}</p>
          <Button variant="outline" size="sm" className="w-full text-[11px] h-7 bg-background shadow-2xs">
            {t("plan.view_status")}
          </Button>
        </div>
      </div>

      {/* Bottom Switcher & Settings */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
        {/* Sun / Moon Switcher Pill */}
        <div className="flex items-center rounded-full bg-slate-200/60 dark:bg-slate-800/60 p-1 border border-slate-300/40 dark:border-slate-700/40">
          <button
            onClick={() => setTheme(THEME_MODE.LIGHT)}
            className={`flex-1 flex items-center justify-center py-1 rounded-full text-xs transition-all ${
              theme === THEME_MODE.LIGHT
                ? "bg-white text-slate-900 shadow-xs font-medium"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme(THEME_MODE.DARK)}
            className={`flex-1 flex items-center justify-center py-1 rounded-full text-xs transition-all ${
              theme === THEME_MODE.DARK
                ? "bg-slate-950 text-slate-100 shadow-xs font-medium"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={openSettings}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>{t("settings.title")}</span>
        </button>
      </div>
    </aside>
  )
}
