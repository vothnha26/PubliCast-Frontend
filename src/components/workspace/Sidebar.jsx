import React from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { SIDEBAR_NAV_GROUPS } from "@/constants/navigation"
import { THEME_MODE } from "@/constants/theme"
import { useThemeStore } from "@/store/useThemeStore"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react"

export default function Sidebar() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const openSettings = useDashboardStore((state) => state.openSettings)
  const isSidebarCollapsed = useDashboardStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar)

  return (
    <aside
      className={`flex flex-col h-screen border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))] shrink-0 select-none pb-px transition-all duration-300 ${
        isSidebarCollapsed ? "w-[64px]" : "w-[220px]"
      }`}
    >
      {/* Header-height spacer + Collapse Toggle Button */}
      <div className="h-14 shrink-0 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between px-3">
        {!isSidebarCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
            {t("header.brand")}
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all mx-auto"
          title={isSidebarCollapsed ? "Mở rộng Thanh điều hướng" : "Thu gọn Thanh điều hướng"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="overflow-y-auto pt-4 flex-1">
        {SIDEBAR_NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.id} className={groupIdx === 0 ? "px-3 pb-6" : "px-3"}>
            {!isSidebarCollapsed && (
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.55px] leading-4 mb-2 px-1 truncate">
                {t(group.titleKey)}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={t(item.labelKey)}
                    className={({ isActive }) =>
                      `flex items-center text-sm transition-all duration-150 active:scale-[0.98] rounded-xl ${
                        isSidebarCollapsed ? "justify-center p-2.5" : "justify-between py-2 px-3"
                      } ${
                        isActive
                          ? "bg-[hsl(var(--sidebar-primary)/0.12)] text-[hsl(var(--sidebar-primary))] font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent)/0.6)]"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                    </div>
                    {!isSidebarCollapsed && item.activeDot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))] shrink-0" />
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
        {/* Plan Card (Hidden when collapsed) */}
        {!isSidebarCollapsed && (
          <div className="px-4 pt-4">
            <div className="rounded-xl border border-[hsl(var(--sidebar-border))] bg-card p-3.5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground tracking-[0.55px]">
                  {t("plan.hub_title")}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{t("plan.enterprise_plan")}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 mt-2 bg-[hsl(var(--sidebar-primary)/0.05)] border-[hsl(var(--sidebar-primary)/0.2)] text-[hsl(var(--sidebar-primary))]"
              >
                {t("plan.view_status")}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Switcher & Settings */}
        <div className="p-3 mt-2 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          {/* Theme Switcher */}
          <div className="flex items-center rounded-full bg-[hsl(var(--sidebar-accent))] p-1 border border-[hsl(var(--sidebar-border))]">
            <button
              onClick={() => setTheme(THEME_MODE.LIGHT)}
              className={`flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 ${
                theme === THEME_MODE.LIGHT ? "bg-card shadow-xs" : "text-muted-foreground"
              }`}
              title="Giao diện sáng"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme(THEME_MODE.DARK)}
              className={`flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 ${
                theme === THEME_MODE.DARK ? "bg-card shadow-xs" : "text-muted-foreground"
              }`}
              title="Giao diện tối"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Settings button */}
          <button
            onClick={openSettings}
            title={t("header.settings")}
            className={`w-full flex items-center text-sm text-muted-foreground hover:text-foreground transition-all duration-150 ${
              isSidebarCollapsed ? "justify-center p-2" : "gap-3 py-1.5 px-2"
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">{t("header.settings")}</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
