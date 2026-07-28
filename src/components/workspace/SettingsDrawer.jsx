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
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronRight } from "lucide-react"

export default function SettingsDrawer() {
  const { t } = useTranslation()
  const { isSettingsOpen, closeSettings } = useDashboardStore()
  const logout = useAuthStore((state) => state.logout)

  return (
    <Sheet open={isSettingsOpen} onOpenChange={closeSettings}>
      <SheetContent side="right" className="flex flex-col h-full sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>{t("settings.title")}</SheetTitle>
          <SheetDescription>{t("settings.desc")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {SETTINGS_DRAWER_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                {t(section.titleKey)}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{t(item.labelKey)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t mt-auto">
          <Button
            variant="destructive"
            className="w-full flex items-center gap-2"
            onClick={() => {
              closeSettings()
              logout()
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
