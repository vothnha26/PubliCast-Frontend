import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ErrorRegistry } from "@/services/ErrorRegistry"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { SOCIAL_PLATFORM } from "@/constants/postComposer"

export default function ValidationErrorRegion() {
  const { t } = useTranslation()
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [isErrorExpanded, setIsErrorExpanded] = useState(true)

  useEffect(() => {
    // Subscribe to ErrorRegistry Observer
    const unsubscribe = ErrorRegistry.subscribe((newErrors) => {
      setErrors(newErrors.filter((e) => e.severity === "error" || !e.severity))
      setWarnings(newErrors.filter((e) => e.severity === "warning"))
    })
    return () => unsubscribe()
  }, [])

  const handleSelectError = (errorItem) => {
    if (!errorItem.targetId) return
    const targetEl = document.getElementById(errorItem.targetId)
    if (targetEl) {
      targetEl.focus()
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" })
      targetEl.classList.add("ring-2", "ring-rose-500")
      setTimeout(() => {
        targetEl.classList.remove("ring-2", "ring-rose-500")
      }, 2000)
    }
  }

  if (errors.length === 0 && warnings.length === 0) return null

  return (
    <div className="font-sans select-none">
      {/* ERRORS BLOCK */}
      {errors.length > 0 && (
        <div className="border border-rose-200 dark:border-rose-900/60 rounded-2xl overflow-hidden shadow-2xs transition-all bg-white dark:bg-slate-900">
          
          {/* Header Bar (Pink Banner) */}
          <button
            type="button"
            id="btn-toggle-error-banner"
            onClick={() => setIsErrorExpanded(!isErrorExpanded)}
            className="w-full px-4 py-2.5 bg-rose-100/70 dark:bg-rose-950/60 flex items-center justify-between text-slate-900 dark:text-rose-100 font-extrabold text-sm cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {/* Solid Red Alert Icon */}
              <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <AlertTriangle className="h-3.5 w-3.5 fill-white text-rose-600" />
              </div>
              <span>{t("composer.errors_count", { count: errors.length })}</span>
            </div>
            {isErrorExpanded ? <ChevronUp className="h-4 w-4 text-slate-700 dark:text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-700 dark:text-slate-300" />}
          </button>

          {/* Collapsible Error Items List */}
          {isErrorExpanded && (
            <div className="p-4 space-y-3 text-xs bg-white dark:bg-slate-900">
              {errors.map((err) => (
                <div
                  key={err.id}
                  onClick={() => handleSelectError(err)}
                  className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium cursor-pointer hover:text-rose-600 transition-colors"
                >
                  {/* Platform Icon */}
                  <div className="shrink-0 flex items-center justify-center">
                    <PlatformIcon platform={err.platform || SOCIAL_PLATFORM.FACEBOOK} size={20} />
                  </div>
                  {/* Message */}
                  <span className="text-xs leading-relaxed font-semibold">{err.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
