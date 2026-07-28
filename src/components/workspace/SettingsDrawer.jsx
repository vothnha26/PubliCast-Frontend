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
import { LogOut, ChevronRight } from "lucide-react"

export default function SettingsDrawer() {
  const { t } = useTranslation()
  const { isSettingsOpen, closeSettings } = useDashboardStore()
  const logout = useAuthStore((state) => state.logout)

  return (
    <Sheet open={isSettingsOpen} onOpenChange={closeSettings}>
      <SheetContent
        side="right"
        className="flex flex-col h-full sm:max-w-xs p-6 bg-slate-100 dark:bg-slate-900 text-foreground border-l border-slate-200 dark:border-slate-800"
      >
        <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <SheetTitle className="text-xl font-bold tracking-tight">
            {t("settings.title")}
          </SheetTitle>
        </SheetHeader>

        {/* 4 Settings Groups */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {SETTINGS_DRAWER_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-2">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-2">
                {t(section.titleKey)}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{t(item.labelKey)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Red Log out */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <button
            className="flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            onClick={() => {
              closeSettings()
              logout()
            }}
          >
            <LogOut className="h-4 w-4 text-rose-600" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
