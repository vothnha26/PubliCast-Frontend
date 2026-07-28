import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/auth/LoginPage"
import DashboardLayout from "@/layout/DashboardLayout"
import PlannerPage from "@/pages/workspace/planner/PlannerPage"
import ContentPlannerPage from "@/pages/workspace/planner/ContentPlannerPage"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/workspace/planner" element={<PlannerPage />} />
          <Route path="/workspace/planner/calendar" element={<ContentPlannerPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/workspace/planner" replace />} />
    </Routes>
  )
}
