import React, { useState, useRef } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Calendar,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Trash2,
  FileCode,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useContentPlanner } from "@/store/useContentPlanner"
import { useBrandStore } from "@/store/useBrandStore"
import { calendarImportExportService } from "@/services/calendarImportExportService"
import { getMonthDateRange } from "@/utils/dateUtils"
import { EXPORT_FORMAT, EXPORT_RANGE } from "@/constants/calendarEvent"

export const MODAL_TAB = {
  IMPORT: "IMPORT",
  EXPORT: "EXPORT",
}

export const IMPORT_STEP = {
  SELECT: "SELECT",
  UPLOAD_ICS: "UPLOAD_ICS",
  UPLOAD_CSV: "UPLOAD_CSV",
}

export default function ImportSyncModal({ isOpen, onClose }) {
  const { fetchPlannerData, currentDate } = useContentPlanner()
  const activeBrand = useBrandStore((state) => state.activeBrand)

  const [activeTab, setActiveTab] = useState(MODAL_TAB.IMPORT)
  const [importStep, setImportStep] = useState(IMPORT_STEP.SELECT)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(true)
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMAT.CSV)
  const [exportRange, setExportRange] = useState(EXPORT_RANGE.MONTH)
  const [successMessage, setSuccessMessage] = useState(null)
  const [showFormatHelp, setShowFormatHelp] = useState(false)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleReset = () => {
    setActiveTab(MODAL_TAB.IMPORT)
    setImportStep(IMPORT_STEP.SELECT)
    setSelectedFile(null)
    setIsDragOver(false)
    setIsProcessing(false)
    setUploadError(null)
    setSuccessMessage(null)
    setShowFormatHelp(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleFileSelect = (file) => {
    setUploadError(null)
    if (!file) return

    // Kiểm tra dung lượng file thực tế (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Dung lượng tệp vượt quá 5MB. Vui lòng tải lên tệp nhỏ hơn.")
      setSelectedFile(file)
      return
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

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "Title,ScheduledDate,Time,Platform\n\"Bài viết mẫu 1\",2026-08-01,09:00,FACEBOOK\n\"Bài viết mẫu 2\",2026-08-02,14:30,INSTAGRAM\n"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sample_planner.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Đã tải tệp mẫu sample_planner.csv về máy!")
  }

  const handleImportSubmit = async () => {
    if (!selectedFile || uploadError) return

    if (importStep !== IMPORT_STEP.UPLOAD_ICS) {
      toast.error("Import CSV chưa khả dụng — tính năng đang trong quá trình phát triển.")
      return
    }

    if (!activeBrand?.id) {
      toast.error("Chưa xác định được brand — không thể import.")
      return
    }

    setIsProcessing(true)
    try {
      const result = await calendarImportExportService.importIcs(activeBrand.id, selectedFile)
      setSuccessMessage(result.message || `Đã nhập thành công "${selectedFile.name}"!`)
      if (fetchPlannerData) fetchPlannerData(activeBrand.id)

      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err) {
      setUploadError(err?.response?.data?.message || "Import thất bại. Kiểm tra lại file .ics.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportSubmit = async () => {
    if (exportFormat !== EXPORT_FORMAT.ICS) {
      toast.error(`Xuất định dạng .${exportFormat.toUpperCase()} chưa khả dụng — backend chưa có endpoint tương ứng.`)
      return
    }

    if (!activeBrand?.id) {
      toast.error("Chưa xác định được brand — không thể xuất dữ liệu.")
      return
    }

    setIsProcessing(true)
    try {
      let startDate, endDate
      if (exportRange === EXPORT_RANGE.WEEK) {
        const d = new Date(currentDate)
        const day = d.getDay()
        const sunday = new Date(d)
        sunday.setDate(d.getDate() - day)
        const saturday = new Date(d)
        saturday.setDate(d.getDate() - day + 6)
        const fmt = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
        startDate = fmt(sunday)
        endDate = fmt(saturday)
      } else if (exportRange === EXPORT_RANGE.ALL) {
        startDate = "2020-01-01"
        endDate = "2030-12-31"
      } else {
        ;[startDate, endDate] = getMonthDateRange(currentDate)
      }

      await calendarImportExportService.exportIcs(activeBrand.id, startDate, endDate)
      setSuccessMessage("Đã xuất thành công lịch dạng .ICS! Kiểm tra thư mục Downloads.")
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xuất dữ liệu thất bại.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-scale-in">
        {/* Header Modal */}
        <div className="px-6 pt-5 pb-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
              <span>Quản lý & Xuất nhập Dữ liệu</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đồng bộ lịch bài đăng, nhập từ tệp và xuất báo cáo nội dung
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 pt-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/60">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab(MODAL_TAB.IMPORT)
                setImportStep(IMPORT_STEP.SELECT)
              }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === MODAL_TAB.IMPORT
                  ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Nhập dữ liệu (Import)</span>
            </button>

            <button
              onClick={() => setActiveTab(MODAL_TAB.EXPORT)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === MODAL_TAB.EXPORT
                  ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất dữ liệu (Export)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: NHẬP DỮ LIỆU (IMPORT) */}
        {activeTab === MODAL_TAB.IMPORT && (
          <div className="p-6 space-y-5">
            {/* Step 1: Chọn phương thức Nhập */}
            {importStep === IMPORT_STEP.SELECT && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Tệp Lịch & Bảng tính (File Upload)
                  </span>

                  {/* Tile 1: ICS Import (Hoạt động) */}
                  <button
                    onClick={() => setImportStep(IMPORT_STEP.UPLOAD_ICS)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Nhập từ tệp .ics (iCalendar)</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Tải lên tập tin lịch biểu (tối đa 5MB, 1000 sự kiện)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                  </button>

                  {/* Tile 2: CSV Import (Sắp ra mắt - Disabled) */}
                  <div
                    onClick={() => toast.info("Tính năng Nhập từ CSV đang được phát triển (Sắp ra mắt).")}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-900/40 opacity-70 cursor-not-allowed text-left group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 shrink-0">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-muted-foreground">Nhập từ bảng tính CSV / Excel</h4>
                          <span className="px-2 py-0.5 bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black tracking-wider uppercase rounded-xs">
                            SẮP RA MẮT
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                          Tạo bài viết hàng loạt từ bảng tính Excel hoặc CSV (Đang phát triển)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Upload File .ics */}
            {importStep === IMPORT_STEP.UPLOAD_ICS && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <button
                    onClick={() => setImportStep(IMPORT_STEP.SELECT)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Quay lại danh sách</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,text/calendar"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />

                {/* Vùng kéo thả File .ics */}
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
                    Kéo & thả tệp .ics của bạn vào đây
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    hoặc nhấp để chọn tệp từ máy tính
                  </p>
                  <div className="mt-3 inline-block px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    TỐI ĐA 5MB · TỐI ĐA 1000 SỰ KIỆN
                  </div>
                </div>

                {/* Tệp đã chọn */}
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
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Thông báo lỗi Validation */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 animate-shake">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Tùy chọn cài đặt nhập */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overwriteDuplicates}
                      onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Ghi đè nếu phát hiện bài viết trùng lặp</span>
                  </label>
                </div>

                {/* Nút hành động */}
                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                  <Button
                    disabled={!selectedFile || !!uploadError || isProcessing}
                    onClick={handleImportSubmit}
                    className="flex-1 h-9 text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-xl shadow-xs gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang nhập dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Tải tệp lên ngay</span>
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClose} className="h-9 text-xs font-bold rounded-xl cursor-pointer">
                    Hủy bỏ
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Upload File CSV */}
            {importStep === IMPORT_STEP.UPLOAD_CSV && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <button
                    onClick={() => setImportStep(IMPORT_STEP.SELECT)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Quay lại danh sách</span>
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
                    Kéo & thả tệp CSV hoặc Excel vào đây
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hỗ trợ tiêu đề cột: Title, ScheduledDate, Time, Platform
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="cursor-pointer">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-500" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải file CSV mẫu (Sample Template)</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                  <Button
                    disabled={!selectedFile || isProcessing}
                    onClick={handleImportSubmit}
                    className="flex-1 h-9 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 cursor-pointer"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>Tải dữ liệu CSV lên</span>
                  </Button>
                  <Button variant="outline" onClick={handleClose} className="h-9 text-xs font-bold rounded-xl cursor-pointer">
                    Hủy bỏ
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: XUẤT DỮ LIỆU (EXPORT) */}
        {activeTab === MODAL_TAB.EXPORT && (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground block uppercase tracking-wider">
                Định dạng xuất báo cáo (Export Format)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setExportFormat(EXPORT_FORMAT.CSV)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    exportFormat === EXPORT_FORMAT.CSV
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Bảng tính CSV</span>
                </button>

                <button
                  onClick={() => setExportFormat(EXPORT_FORMAT.ICS)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    exportFormat === EXPORT_FORMAT.ICS
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Lịch (.ics)</span>
                </button>

                <button
                  onClick={() => setExportFormat(EXPORT_FORMAT.PDF)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    exportFormat === EXPORT_FORMAT.PDF
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Báo cáo PDF</span>
                </button>

                <button
                  onClick={() => setExportFormat(EXPORT_FORMAT.JSON)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    exportFormat === EXPORT_FORMAT.JSON
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <FileCode className="h-5 w-5" />
                  <span>Sao lưu JSON</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-bold text-muted-foreground block uppercase tracking-wider">
                Khoảng thời gian xuất (Date Range)
              </label>
              <select
                value={exportRange}
                onChange={(e) => setExportRange(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={EXPORT_RANGE.MONTH}>Tháng hiện tại</option>
                <option value={EXPORT_RANGE.WEEK}>Tuần hiện tại</option>
                <option value={EXPORT_RANGE.ALL}>Tất cả bài viết trong Lịch</option>
              </select>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center gap-2">
              <Button
                disabled={isProcessing}
                onClick={handleExportSubmit}
                className="flex-1 h-9 text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-white rounded-xl gap-2 shadow-xs cursor-pointer"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Xuất dữ liệu .{exportFormat.toUpperCase()} ngay</span>
              </Button>
              <Button variant="outline" onClick={handleClose} className="h-9 text-xs font-bold rounded-xl cursor-pointer">
                Hủy bỏ
              </Button>
            </div>
          </div>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="mx-6 mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-scale-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Khối Trợ giúp Định dạng File */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={() => setShowFormatHelp(!showFormatHelp)}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Hướng dẫn quy chuẩn định dạng tệp .CSV & .ICS</span>
          </button>
          <span className="text-[10px] text-muted-foreground">PubliCast Helper</span>
        </div>

        {/* Dialog trợ giúp định dạng */}
        {showFormatHelp && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border-t border-indigo-200 dark:border-indigo-800 text-xs space-y-2 animate-fade-in">
            <p className="font-bold text-foreground">💡 Quy định cấu trúc tệp hợp lệ:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li><strong>Tệp .ics:</strong> Tuân theo chuẩn iCalendar RFC 5545 tiêu chuẩn.</li>
              <li><strong>Tệp .csv:</strong> Cột gồm <code>Title, ScheduledDate (YYYY-MM-DD), Time (HH:mm), Platform</code>.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
