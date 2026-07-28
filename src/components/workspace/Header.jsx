import React from "react"
import { useTranslation } from "react-i18next"
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
import { Search, Plus, Bell, Settings, LogOut, User } from "lucide-react"

export default function Header() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const openSettings = useDashboardStore((state) => state.openSettings)

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U"

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("header.search")}
          className="pl-9 h-9 text-xs bg-muted/40 border-none shadow-none focus-visible:ring-1"
        />
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>{t("header.quick_create")}</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.email} />
                <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>{t("header.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={openSettings}>
              <Settings className="h-4 w-4" />
              <span>{t("header.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
