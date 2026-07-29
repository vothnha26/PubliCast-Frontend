import React from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, X } from "lucide-react"

export default function ModalHeader({ user = { name: "Nhã Võ", initials: "NH" }, onClose }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card shrink-0 shadow-2xs z-10 select-none">
      {/* Left: Back to Calendar Button + Title & User Badge */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          id="btn-back-to-calendar"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
          title={t("composer.back_to_calendar")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("composer.back_to_calendar")}</span>
        </button>

        <div className="h-5 w-px bg-border/80" />

        <h2 className="text-lg font-black text-foreground tracking-tight">{t("composer.title")}</h2>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
            {user.initials}
          </span>
          <span>{user.name}</span>
        </div>
      </div>

      {/* Right: Circular Highlighted Close Action Button */}
      <button
        type="button"
        id="btn-modal-close"
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-300 transition-all flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
        title={t("composer.close")}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
