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
      {/*
        TODO(auth): ProtectedRoute đang KHÔNG được bọc quanh DashboardLayout bên dưới,
        để xem UI khi chưa nối backend thật. Phải bọc lại <ProtectedRoute> trước khi
        nối API thật / commit lên nhánh chính, nếu không mọi trang sẽ truy cập được
        mà không cần đăng nhập.
      */}
      <Route element={<DashboardLayout />}>
        <Route path="/workspace/planner" element={<PlannerPage />} />
        <Route path="/workspace/planner/calendar" element={<ContentPlannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/workspace/planner" replace />} />
    </Routes>
  )
}
