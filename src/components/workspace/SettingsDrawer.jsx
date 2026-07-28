import React from "react"
import { useTranslation } from "react-i18next"
import { useDashboardStore } from "@/store/useDashboardStore"
import { useAuthStore } from "@/store/useAuthStore"
import { SETTINGS_DRAWER_SECTIONS } from "@/constants/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LogOut } from "lucide-react"

export default function SettingsDrawer() {
  const { t } = useTranslation()
  const { isSettingsOpen, closeSettings } = useDashboardStore()
  const logout = useAuthStore((state) => state.logout)

  return (
    <Sheet open={isSettingsOpen} onOpenChange={closeSettings}>
      <SheetContent
        side="right"
        className="flex flex-col h-full sm:max-w-[280px] p-6 bg-[hsl(var(--sidebar-accent))] text-foreground border-l"
      >
        <SheetHeader className="pb-8">
          <SheetTitle className="text-xl font-bold tracking-tight">
            {t("settings.title")}
          </SheetTitle>
        </SheetHeader>

        {/* 4 Settings Groups */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          {SETTINGS_DRAWER_SECTIONS.map((section) => (
            <div key={section.id} className="pb-4">
              <h4 className="text-[11px] font-bold tracking-[0.55px] text-muted-foreground px-2 mb-1">
                {t(section.titleKey)}
              </h4>
              <div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-4 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-card/60 transition-all duration-150 active:scale-[0.98] text-left"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{t(item.labelKey)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Red Log out */}
        <div className="pt-4 border-t border-[hsl(var(--sidebar-border))] mt-auto">
          <button
            className="w-full flex items-center gap-4 px-2 py-2 rounded-lg text-sm font-normal text-destructive hover:bg-card/60 transition-all duration-150 active:scale-[0.98]"
            onClick={() => {
              closeSettings()
              logout()
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
