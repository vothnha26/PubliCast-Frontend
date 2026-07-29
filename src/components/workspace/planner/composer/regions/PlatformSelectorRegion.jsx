import React from "react"
import { useTranslation } from "react-i18next"
import { TARGET_PLATFORMS } from "@/constants/postComposer"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { ChevronDown, Edit3, StickyNote } from "lucide-react"

export default function PlatformSelectorRegion({
  selectedPlatforms = [],
  onTogglePlatform,
  platformFormats = {},
  onFormatChange,
  isEditByNetwork = false,
  onToggleEditByNetwork,
  onToggleNotes,
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-3 py-1 font-sans select-none">
      {/* Left side: Pure Borderless Platform Icons + CHỈNH THEO KÊNH button */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 min-w-0">
        {/* Horizontal Borderless Platform Selection Icons */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar shrink-0">
          {Object.values(TARGET_PLATFORMS).map((p) => {
            const isSelected = selectedPlatforms.includes(p.id)
            const activeFormat = platformFormats[p.id] || p.allowedFormats[0]

            return (
              <div key={p.id} className="flex items-center gap-1.5 shrink-0">
                {/* Pure Borderless Icon Button */}
                <button
                  type="button"
                  id={`btn-select-platform-${p.id}`}
                  onClick={() => onTogglePlatform(p.id)}
                  className={`relative p-0.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "scale-110 opacity-100 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 shadow-sm"
                      : "opacity-40 hover:opacity-90 hover:scale-105 filter grayscale hover:grayscale-0"
                  }`}
                  title={p.name}
                >
                  <PlatformIcon platform={p.id} size={32} />
                </button>

                {/* Optional Post Type Dropdown per platform */}
                {isSelected && p.allowedFormats.length > 1 && (
                  <div className="relative inline-flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                    <select
                      value={activeFormat}
                      onChange={(e) => onFormatChange(p.id, e.target.value)}
                      className="bg-transparent pr-3 focus:outline-none appearance-none cursor-pointer font-extrabold uppercase tracking-wider text-[9px]"
                    >
                      {p.allowedFormats.map((fmt) => (
                        <option key={fmt} value={fmt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {fmt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-2.5 w-2.5 absolute right-1 pointer-events-none text-slate-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Separator Line */}
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-800 shrink-0" />

        {/* Edit by Network Switcher Button */}
        <button
          type="button"
          id="btn-edit-by-network"
          onClick={onToggleEditByNetwork}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer shrink-0 ${
            isEditByNetwork
              ? "bg-indigo-600 text-white ring-2 ring-indigo-500/30"
              : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>{t("composer.edit_by_network")}</span>
        </button>
      </div>

      {/* Notes Toggle Button on Right */}
      <button
        type="button"
        id="btn-toggle-notes"
        onClick={onToggleNotes}
        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all shadow-xs shrink-0 cursor-pointer"
      >
        <StickyNote className="h-4 w-4 text-amber-500" />
        <span>{t("composer.notes")}</span>
      </button>
    </div>
  )
}
