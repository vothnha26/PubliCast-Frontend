import React from "react"
import BentoGrid from "@/components/workspace/BentoGrid"

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Workspace Overview & Planner</h1>
        <p className="text-xs text-muted-foreground">
          PubliCast social media management dashboard canvas.
        </p>
      </div>

      <BentoGrid />
    </div>
  )
}
