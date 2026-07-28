import React from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { HEADER_TOP_NAV } from "@/constants/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, ChevronDown, Settings, LogOut, LayoutGrid, PanelLeft } from "lucide-react"

export default function Header() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const openSettings = useDashboardStore((state) => state.openSettings)
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar)
  const isSidebarCollapsed = useDashboardStore((state) => state.isSidebarCollapsed)

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U"

  return (
    <header className="h-14 border-b bg-background px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Sidebar Toggle + Logo + Search input */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
          title={isSidebarCollapsed ? "Mở rộng Thanh menu trái" : "Thu gọn Thanh menu trái"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-white shrink-0">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span className="font-black text-xl tracking-[-0.5px] text-[hsl(var(--sidebar-primary))]">
            {t("header.brand")}
          </span>
        </div>

        <div className="relative w-64 pl-8">
          <Search className="absolute left-11 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("header.search")}
            className="pl-8 h-8 text-xs bg-[hsl(var(--sidebar-accent))] border-none shadow-none rounded-lg focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Center: Top Icons Navigation */}
      <div className="flex items-center gap-6 px-6 border-x border-border/60">
        {HEADER_TOP_NAV.map((nav) => {
          const Icon = nav.icon
          return (
            <NavLink
              key={nav.id}
              to={nav.path}
              className={({ isActive }) =>
                `p-1.5 rounded-md transition-all duration-150 active:scale-90 relative ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
              title={t(nav.labelKey)}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4" />
                  {isActive && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Right: Upgrade button + Bell + Workspace selector */}
      <div className="flex items-center gap-3">
        <Button className="h-8 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
          {t("header.upgrade")}
        </Button>

        {/* Bell icon with red indicator dot */}
        <button className="relative p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-150 active:scale-90">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </button>

        {/* Workspace mode profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 border rounded-full pl-1.5 pr-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95">
              <Avatar className="h-5 w-5">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-[10px] bg-slate-300 dark:bg-slate-700">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span>{t("header.workspace_mode")}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={openSettings}>
              <Settings className="h-3.5 w-3.5" />
              <span>{t("settings.title")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-xs cursor-pointer text-rose-600 focus:text-rose-600"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
