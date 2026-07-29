import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Calendar, ChevronDown, ChevronUp, Check, Gem } from "lucide-react"

export default function ModalFooterRegion({
  scheduledAt,
  onScheduledAtChange,
  isSubmitting = false,
  hasBlockingErrors = false,
  onSubmit,
  onCancel,
  postsCount = 2,
}) {
  const { t } = useTranslation()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showScheduleMenu, setShowScheduleMenu] = useState(false)
  const [selectedAction, setSelectedAction] = useState("SCHEDULE")

  const formattedDate = new Date(scheduledAt || Date.now()).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  // LIBRARY/REVIEW/PUBLISH_NOW/RECURRING have no backend support yet — listed
  // as disabled "coming soon" so the dropdown doesn't silently behave like
  // Schedule when one of them is picked (see composer review — the submit
  // button previously ignored selectedAction entirely).
  const scheduleActions = [
    {
      id: "DRAFT",
      title: t("composer.save_draft"),
      subtitle: t("composer.save_draft_desc"),
      isPremium: false,
      isAvailable: true,
    },
    {
      id: "SCHEDULE",
      title: t("composer.schedule_desc"),
      subtitle: t("composer.schedule_desc"),
      isPremium: false,
      isAvailable: true,
    },
    {
      id: "LIBRARY",
      title: t("composer.save_to_library"),
      subtitle: t("composer.save_library_desc"),
      isPremium: true,
      isAvailable: false,
    },
    {
      id: "REVIEW",
      title: t("composer.send_for_review"),
      subtitle: t("composer.send_review_desc"),
      isPremium: true,
      isAvailable: false,
    },
    {
      id: "PUBLISH_NOW",
      title: t("composer.publish_now"),
      subtitle: t("composer.publish_now_desc"),
      isPremium: false,
      isAvailable: false,
    },
    {
      id: "RECURRING",
      title: t("composer.recurring_schedule"),
      subtitle: t("composer.recurring_desc"),
      isPremium: true,
      isAvailable: false,
    },
  ]

  const getButtonLabel = () => {
    switch (selectedAction) {
      case "DRAFT":
        return t("composer.save_draft")
      case "SCHEDULE":
      default:
        return t("composer.schedule_count", { count: postsCount })
    }
  }

  return (
    <div className="pt-4 border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shrink-0 select-none font-sans">
      {/* Left: Cancel Action */}
      <button
        type="button"
        id="btn-composer-cancel"
        onClick={onCancel}
        className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer"
      >
        {t("composer.cancel")}
      </button>

      {/* Right Actions: Date Time Picker + Schedule CTA Button with Dropdown */}
      <div className="flex items-center gap-3">
        {/* Date Time Picker Control */}
        <div className="relative">
          <button
            type="button"
            id="btn-date-time-picker"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>{formattedDate}</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 bottom-full mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl z-50 animate-scale-in text-xs">
              <label className="block font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">{t("composer.select_date_time")}</label>
              <input
                type="datetime-local"
                value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  onScheduledAtChange(new Date(e.target.value).toISOString())
                  setShowDatePicker(false)
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
              />
            </div>
          )}
        </div>

        {/* Schedule CTA Button with Popover Dropdown */}
        <div className="relative">
          <div className="inline-flex rounded-xl shadow-md shadow-indigo-500/20 overflow-hidden border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              id="btn-composer-submit"
              disabled={isSubmitting || hasBlockingErrors}
              onClick={() => onSubmit(selectedAction === "DRAFT")}
              className={`px-5 py-2.5 font-black text-xs tracking-wide transition-all cursor-pointer ${
                hasBlockingErrors
                  ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
              }`}
            >
              {getButtonLabel()}
            </button>

            <button
              type="button"
              id="btn-schedule-dropdown-toggle"
              onClick={() => setShowScheduleMenu(!showScheduleMenu)}
              className={`px-2.5 py-2.5 border-l text-xs transition-all cursor-pointer ${
                hasBlockingErrors
                  ? "bg-slate-200 text-slate-500 dark:bg-slate-800 border-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-indigo-500"
              }`}
            >
              {showScheduleMenu ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Schedule Popover Dropdown Menu */}
          {showScheduleMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-scale-in text-xs space-y-1">
              {scheduleActions.map((action) => {
                const isSelected = selectedAction === action.id
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={!action.isAvailable}
                    onClick={() => {
                      if (!action.isAvailable) return
                      setSelectedAction(action.id)
                      setShowScheduleMenu(false)
                    }}
                    className={`w-full flex items-start justify-between p-3 rounded-xl transition-colors text-left ${
                      !action.isAvailable
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-slate-100 dark:bg-slate-800 cursor-pointer"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                        {action.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                        {action.isAvailable ? action.subtitle : t("composer.coming_soon")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {action.isPremium && (
                        <div className="w-5 h-5 rounded-full bg-lime-200 dark:bg-lime-900/60 text-lime-800 dark:text-lime-300 flex items-center justify-center">
                          <Gem className="h-3 w-3 fill-lime-500 text-lime-600" />
                        </div>
                      )}
                      {isSelected && action.isAvailable && (
                        <Check className="h-4 w-4 text-slate-900 dark:text-slate-100 stroke-[3]" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
