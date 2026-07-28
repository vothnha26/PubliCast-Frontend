import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/workspace/Sidebar"
import Header from "@/components/workspace/Header"
import SettingsDrawer from "@/components/workspace/SettingsDrawer"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <Header />

        {/* Scrollable Canvas area */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <Outlet />
        </main>
      </div>

      {/* Right Settings Side Drawer */}
      <SettingsDrawer />
    </div>
  )
}
