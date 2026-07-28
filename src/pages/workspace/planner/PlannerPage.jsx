import React from "react"
import { useTranslation } from "react-i18next"
import BentoGrid from "@/components/workspace/BentoGrid"

export default function PlannerPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("planner_page.title")}</h1>
        <p className="text-xs text-muted-foreground">
          {t("planner_page.desc")}
        </p>
      </div>

      <BentoGrid />
    </div>
  )
}
