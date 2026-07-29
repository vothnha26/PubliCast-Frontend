import React, { useState } from "react"
import { TARGET_PLATFORMS, SOCIAL_PLATFORM } from "@/constants/postComposer"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { renderPreviewCard } from "@/factories/PreviewCardFactory"
import { Smartphone, Monitor, Info } from "lucide-react"

export default function LivePreviewRegion({
  selectedPlatforms = [],
  activePreviewPlatform = SOCIAL_PLATFORM.FACEBOOK,
  onSelectPreviewPlatform,
  draft,
  postFormat,
  onSetThreadActiveIndex,
}) {
  const [deviceMode, setDeviceMode] = useState("mobile")

  return (
    <div className="w-[520px] p-6 hidden lg:flex flex-col border-l border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 select-none overflow-y-auto min-h-0 shrink-0">
      {/* Header: Platform Switcher Tabs + Device Mode Switcher */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        {/* Platform Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {selectedPlatforms.map((pId) => {
            const p = TARGET_PLATFORMS[pId]
            const isActive = activePreviewPlatform === pId
            return (
              <button
                key={pId}
                type="button"
                id={`btn-preview-tab-${pId}`}
                onClick={() => onSelectPreviewPlatform(pId)}
                className={`p-2 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md scale-105"
                    : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
                title={p?.name}
              >
                <PlatformIcon platform={pId} size={18} />
              </button>
            )
          })}
        </div>

        {/* Device Switcher (Mobile 📱 vs Desktop 🖥️) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
          <button
            type="button"
            id="btn-device-mobile"
            onClick={() => setDeviceMode("mobile")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Chế độ di động 📱"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            id="btn-device-desktop"
            onClick={() => setDeviceMode("desktop")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              deviceMode === "desktop"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Chế độ máy tính 🖥️"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Feed Preview Mockup Container (Spacious Width) */}
      <div className="flex-1 flex items-center justify-center py-4">
        {renderPreviewCard(activePreviewPlatform, draft, postFormat, onSetThreadActiveIndex)}
      </div>

      {/* Notice Callout Box (Matching Wireframe 100%) */}
      <div className="mt-auto p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200 shadow-xs">
        <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold">
          Previews are an approximation of how your post will look when published. The final post may look slightly different.
        </p>
      </div>
    </div>
  )
}
