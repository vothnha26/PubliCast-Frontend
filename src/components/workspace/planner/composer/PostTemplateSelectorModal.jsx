import React, { useState } from "react"
import { POST_TEMPLATES } from "@/constants/postComposer"
import { X, Search, Gem, CheckCircle2, Megaphone, Lightbulb, BarChart3, PartyPopper } from "lucide-react"

const TEMPLATE_ICONS = {
  tpl_product_launch: Megaphone,
  tpl_expert_knowledge: Lightbulb,
  tpl_monthly_report: BarChart3,
  tpl_minigame_giveaway: PartyPopper,
}

export default function PostTemplateSelectorModal({ isOpen, onClose, onApplyTemplate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("tpl_monthly_report")

  if (!isOpen) return null

  const filteredTemplates = POST_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConfirm = () => {
    if (selectedTemplateId) {
      onApplyTemplate(selectedTemplateId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Gem className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Chọn mẫu bài viết</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Template List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredTemplates.map((tpl) => {
            const IconComp = TEMPLATE_ICONS[tpl.id] || Gem
            const isSelected = selectedTemplateId === tpl.id

            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 relative ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30"
                    : "border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <IconComp className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1 pr-6">
                  <h4 className="text-xs font-extrabold text-foreground">{tpl.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    {tpl.platforms.map((pId) => (
                      <span
                        key={pId}
                        className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase"
                      >
                        {pId}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all"
          >
            Sử dụng mẫu này
          </button>
        </div>
      </div>
    </div>
  )
}
