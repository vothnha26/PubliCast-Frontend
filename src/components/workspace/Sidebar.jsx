import React from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { MAIN_NAV_ITEMS } from "@/constants/navigation"
import { THEME_MODE } from "@/constants/theme"
import { useThemeStore } from "@/store/useThemeStore"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Sun, Moon, Settings, Zap } from "lucide-react"

export default function Sidebar() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const openSettings = useDashboardStore((state) => state.openSettings)

  return (
    <aside className="w-56 flex flex-col h-screen border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))] transition-colors shrink-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-[hsl(var(--sidebar-border))] gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          P
        </div>
        <span className="font-bold text-base tracking-tight">PubliCast</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "hover:bg-[hsl(var(--sidebar-accent))/50] text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Plan Subscription Card */}
      <div className="p-3">
        <Card className="bg-background/50 border-[hsl(var(--sidebar-border))] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold">{t("plan.pro_title")}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">{t("plan.pro_desc")}</p>
          <Button size="sm" variant="outline" className="w-full text-xs h-7">
            {t("plan.upgrade")}
          </Button>
        </Card>
      </div>

      {/* Footer Tools */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
        >
          {theme === THEME_MODE.DARK ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={openSettings}
          title={t("header.settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
