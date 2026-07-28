import React from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { SIDEBAR_NAV_GROUPS } from "@/constants/navigation"
import { THEME_MODE } from "@/constants/theme"
import { useThemeStore } from "@/store/useThemeStore"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Settings } from "lucide-react"

export default function Sidebar() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const openSettings = useDashboardStore((state) => state.openSettings)

  return (
    <aside className="w-[220px] flex flex-col h-screen border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))] shrink-0 select-none pb-px">
      {/* Header-height spacer to align with top Header bar */}
      <div className="h-14 shrink-0 border-b border-[hsl(var(--sidebar-border))]" />

      {/* Navigation Groups */}
      <nav className="overflow-y-auto pt-4">
        {SIDEBAR_NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.id} className={groupIdx === 0 ? "px-4 pb-6" : "px-4"}>
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.55px] leading-4 mb-2">
              {t(group.titleKey)}
            </h4>
            <div className="-mx-4">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-2 text-sm transition-all duration-150 active:scale-[0.98] ${
                        isActive
                          ? "bg-[hsl(var(--sidebar-primary)/0.1)] border-l-2 border-[hsl(var(--sidebar-primary))] pl-[18px] pr-4 text-[hsl(var(--sidebar-primary))] font-semibold"
                          : "pl-5 pr-4 text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent)/0.5)]"
                      }`
                    }
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-4 w-4" />
                      <span>{t(item.labelKey)}</span>
                    </div>
                    {item.activeDot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan Card & Footer Wrapper pushed to bottom */}
      <div className="mt-auto">
        {/* Plan Card */}
        <div className="px-4 pt-6">
        <div className="rounded-xl border border-[hsl(var(--sidebar-border))] bg-card p-[17px] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground tracking-[0.55px]">
              {t("plan.hub_title")}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">{t("plan.enterprise_plan")}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm h-auto py-[5px] mt-2 bg-[hsl(var(--sidebar-primary)/0.05)] border-[hsl(var(--sidebar-primary)/0.2)] text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.1)]"
          >
            {t("plan.view_status")}
          </Button>
        </div>
      </div>

      {/* Bottom Switcher & Settings */}
      <div className="px-4 pt-4 mt-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
        {/* Sun / Moon Switcher Pill */}
        <div className="flex items-center rounded-full bg-[hsl(var(--sidebar-accent))] p-[5px] border border-[hsl(var(--sidebar-border))]">
          <button
            onClick={() => setTheme(THEME_MODE.LIGHT)}
            className={`flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 active:scale-90 ${
              theme === THEME_MODE.LIGHT ? "bg-card shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme(THEME_MODE.DARK)}
            className={`flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 active:scale-90 ${
              theme === THEME_MODE.DARK ? "bg-card shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={openSettings}
          className="w-full flex items-center gap-4 py-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-[0.98]"
        >
          <Settings className="h-4 w-4" />
          <span>{t("header.settings")}</span>
        </button>
      </div>
    </div>
  </aside>
  )
}
