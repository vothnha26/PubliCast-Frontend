import React from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"

export default function PlannerPage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Workspace Planner</h1>
      <p className="text-muted-foreground">
        Authenticated Session Active. User: {user?.email || JSON.stringify(user)}
      </p>
      <Button variant="outline" onClick={() => logout()}>
        Logout Session
      </Button>
    </div>
  )
}
