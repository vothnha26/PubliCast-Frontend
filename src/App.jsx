import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/auth/LoginPage"
import DashboardLayout from "@/layout/DashboardLayout"
import PlannerPage from "@/pages/workspace/planner/PlannerPage"
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
        {/*
          TODO(planner): "/workspace/planner" và "/workspace/planner/calendar" tạm thời
          trỏ chung PlannerPage (placeholder BentoGrid dashboard, chưa phải trang Planner
          thật — lịch tuần/tháng, filter platform...). Khi thiết kế Planner thật xong,
          tách 2 route này ra 2 page riêng (hoặc quyết định gộp 1 route duy nhất nếu
          "/calendar" không cần tồn tại độc lập).
        */}
        <Route path="/workspace/planner" element={<PlannerPage />} />
        <Route path="/workspace/planner/calendar" element={<PlannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/workspace/planner" replace />} />
    </Routes>
  )
}
