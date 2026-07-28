import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "@/components/workspace/Sidebar"
import Header from "@/components/workspace/Header"
import SettingsDrawer from "@/components/workspace/SettingsDrawer"

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <Header />

        {/* Scrollable Canvas area */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div key={location.pathname} className="h-full w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Right Settings Side Drawer */}
      <SettingsDrawer />
    </div>
  )
}
