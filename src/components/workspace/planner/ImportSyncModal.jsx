import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Calendar,
  FileSpreadsheet,
  HardDrive,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContentPlanner } from "@/store/useContentPlanner"

export const MODAL_STEP = {
  MAIN: "MAIN",
  UPLOAD_ICS: "UPLOAD_ICS",
  UPLOAD_CSV: "UPLOAD_CSV",
  EXPORT: "EXPORT",
}

export default function ImportSyncModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { fetchPlannerData } = useContentPlanner()

  const [step, setStep] = useState(MODAL_STEP.MAIN)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [destination, setDestination] = useState("Main Scheduler")
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(true)
  const [exportFormat, setExportFormat] = useState("csv")
  const [successMessage, setSuccessMessage] = useState(null)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleReset = () => {
    setStep(MODAL_STEP.MAIN)
    setSelectedFile(null)
    setIsDragOver(false)
    setIsUploading(false)
    setUploadError(null)
    setSuccessMessage(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleFileSelect = (file) => {
    setUploadError(null)
    if (!file) return

    // File validation
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit. Please upload a smaller file.")
      setSelectedFile(file)
      return
    }

    // Simulate event limit check (e.g. filename contains 'large' or > 1000 events)
    if (file.name.toLowerCase().includes("large") || file.name.toLowerCase().includes("q4")) {
      setUploadError("File exceeds 1000 events limit. Please split into smaller files.")
    }

    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleImportSubmit = async () => {
    if (!selectedFile || uploadError) return

    setIsUploading(true)
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false)
      setSuccessMessage(`Import thành công ${selectedFile.name} vào ${destination}!`)
      if (fetchPlannerData) fetchPlannerData()

      setTimeout(() => {
        handleClose()
      }, 1500)
    }, 1200)
  }

  const handleExportSubmit = () => {
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setSuccessMessage(`Đã xuất dữ liệu Lịch bài viết dạng .${exportFormat.toUpperCase()}!`)
      setTimeout(() => {
        handleClose()
      }, 1500)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-scale-in select-none">
        {/* Step 1: Main Selection Menu (Matching Image 1) */}
        {step === MODAL_STEP.MAIN && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Import Content
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Import .ics */}
              <button
                onClick={() => setStep(MODAL_STEP.UPLOAD_ICS)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Import from .ics file</h4>
                    <p className="text-xs text-muted-foreground">
                      Upload a calendar file (max 5MB, up to 1000 events)
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
              </button>

              {/* Option 2: Import CSV (PRO) */}
              <button
                onClick={() => setStep(MODAL_STEP.UPLOAD_CSV)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 hover:border-amber-200 dark:hover:border-amber-800 transition-all group text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">Import from CSV</h4>
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-black tracking-wider uppercase rounded-xs">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bulk-create posts from a spreadsheet
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
              </button>

              {/* Option 3: Google Drive */}
              <button
                onClick={() => {
                  setSuccessMessage("Đã kết nối với Google Drive! Đang đồng bộ media...")
                  setTimeout(() => setSuccessMessage(null), 2000)
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Browse Google Drive</h4>
                    <p className="text-xs text-muted-foreground">
                      Import media directly from Drive
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
              </button>

              {/* Option 4: Export Data */}
              <button
                onClick={() => setStep(MODAL_STEP.EXPORT)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Export Calendar Data</h4>
                    <p className="text-xs text-muted-foreground">
                      Export posts to CSV, iCal, or PDF report
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
              </button>
            </div>

            {/* Success toast if any */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Footer Help Link */}
            <div className="pt-3 border-t border-border/60 text-center">
              <button
                onClick={() => alert("Định dạng file hỗ trợ: .ics (iCalendar standard) và .csv (Title, ScheduledDate, Time, Platform, Description).")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Need help with formats?</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload .ics Calendar (Matching Image 2, 3 & 5) */}
        {step === MODAL_STEP.UPLOAD_ICS && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <button
                onClick={() => setStep(MODAL_STEP.MAIN)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Import .ics Calendar</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />

            {/* Drag & Drop Dotted Zone (Image 2 & 3 style) */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                uploadError
                  ? "border-rose-400 bg-rose-500/5"
                  : isDragOver
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Drag & drop your .ics file here
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                or click to browse
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                MAX 5MB · UP TO 1000 EVENTS
              </div>
            </div>

            {/* File Preview Pill (Image 3 & 5 style) */}
            {selectedFile && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    setUploadError(null)
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Error Limit Validation Alert (Image 3 style) */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Options Section (Image 5 style) */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Destination
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Main Scheduler">Main Scheduler</option>
                  <option value="Drafts">Drafts Folder</option>
                  <option value="Pending Approval">Pending Approval</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwriteDuplicates}
                  onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Overwrite duplicates</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border/60 flex items-center gap-2">
              <Button
                disabled={!selectedFile || !!uploadError || isUploading}
                onClick={handleImportSubmit}
                className="flex-1 h-9 text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-xl shadow-xs gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Import File</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-9 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Upload CSV Spreadsheet */}
        {step === MODAL_STEP.UPLOAD_CSV && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <button
                onClick={() => setStep(MODAL_STEP.MAIN)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Import CSV Spreadsheet</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:border-amber-400 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Drag & drop your CSV or Excel file
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Support headers: Title, Date, Time, Platform
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-500" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => alert("Tải xuống sample_planner.csv thành công!")}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center gap-2">
              <Button
                disabled={!selectedFile || isUploading}
                onClick={handleImportSubmit}
                className="flex-1 h-9 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>Import CSV Posts</span>
              </Button>
              <Button variant="outline" onClick={handleClose} className="h-9 text-xs font-bold rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Export Data Options */}
        {step === MODAL_STEP.EXPORT && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <button
                onClick={() => setStep(MODAL_STEP.MAIN)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Export Planner Data</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    exportFormat === "csv"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground"
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>CSV File</span>
                </button>

                <button
                  onClick={() => setExportFormat("ics")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    exportFormat === "ics"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>iCal (.ics)</span>
                </button>

                <button
                  onClick={() => setExportFormat("pdf")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    exportFormat === "pdf"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>PDF Report</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center gap-2">
              <Button
                disabled={isUploading}
                onClick={handleExportSubmit}
                className="flex-1 h-9 text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-xl gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Download .{exportFormat.toUpperCase()}</span>
              </Button>
              <Button variant="outline" onClick={handleClose} className="h-9 text-xs font-bold rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
