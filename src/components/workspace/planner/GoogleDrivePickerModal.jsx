import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  X,
  ChevronLeft,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Folder,
  Users,
  Star,
  Clock,
  FileImage,
  Video,
  FileText,
  Upload,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  HardDrive,
  GripVertical,
  MoveUpRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useBrandStore } from "@/store/useBrandStore"
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { DRIVE_STATUS } from "@/constants/googleDrive"

// variant="floating" (mặc định): widget nổi góc dưới-phải màn hình, tự đóng
// khung/shadow — dùng khi mở từ 1 nút/modal tạm thời.
// variant="panel": khớp bản gốc PubliCast/frontend WeeklyCalendarView.jsx —
// gắn cố định cạnh lịch trong layout chính (ContentPlannerPage.jsx), cao hết
// chiều cao khu vực nội dung, không có border/shadow/position riêng (cha
// (ContentPlannerPage) chịu trách nhiệm bố cục, panel chỉ lấp đầy 100%).
export default function GoogleDrivePickerModal({ isOpen, onClose, onSelectFile, variant = "floating" }) {
  const { t } = useTranslation()
  const activeBrand = useBrandStore((state) => state.activeBrand)
  const { status, files, account, fetchFiles, connect, downloadFile } = useGoogleDrive(activeBrand?.id)

  const [currentFolder, setCurrentFolder] = useState(null) // null = Home, "my-drive" = My Drive folder
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [successToast, setSuccessToast] = useState(null)
  const [draggingFile, setDraggingFile] = useState(null)

  useEffect(() => {
    if (isOpen && activeBrand?.id) {
      fetchFiles()
    }
  }, [isOpen, activeBrand?.id, fetchFiles])

  if (!isOpen) return null

  // IDLE nghĩa là chưa gọi API lần nào (trước khi useEffect fetchFiles chạy xong)
  // — KHÔNG được coi là "đã connected". Chỉ CONNECTED mới là đã connected thật.
  const isConnected = status === DRIVE_STATUS.CONNECTED
  const isLoadingFiles = status === DRIVE_STATUS.LOADING || status === DRIVE_STATUS.IDLE
  const hasFetchError = status === DRIVE_STATUS.ERROR

  const handleConnectDrive = async () => {
    setIsConnecting(true)
    await connect()
    setIsConnecting(false)
  }

  // Không fallback về mock data khi API trả rỗng/lỗi — hiển thị đúng trạng thái
  // thật (rỗng thật hoặc lỗi thật), để không đánh tráo dữ liệu giả khi test.
  const displayFiles = files || []

  const handleImportFile = async (file) => {
    setSelectedMedia(file)
    try {
      const downloadData = await downloadFile(file.id, file.name)
      setSuccessToast(`Đã tải "${file.name}" từ Google Drive!`)
      if (onSelectFile) {
        onSelectFile({ ...file, videoUrl: downloadData?.videoUrl })
      }
    } catch {
      setSuccessToast(null)
      toast.error(`Không tải được "${file.name}" từ Drive`)
    } finally {
      setTimeout(() => setSuccessToast(null), 2000)
    }
  }

  const handleDragStart = (e, file) => {
    setDraggingFile(file)
    e.dataTransfer.setData("application/json", JSON.stringify(file))
    e.dataTransfer.setData("text/plain", file.name)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = () => {
    setDraggingFile(null)
  }

  const outerClassName =
    variant === "panel"
      ? "h-full w-full animate-fade-in pointer-events-auto"
      : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-slide-up pointer-events-auto"

  const cardClassName =
    variant === "panel"
      ? "h-full w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      : "w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"

  return (
    <div className={outerClassName}>
      {/* Floating Card */}
      <div className={cardClassName}>
        {/* Loading State — trạng thái khởi tạo, đang chờ fetchFiles() lần đầu trả kết quả */}
        {isLoadingFiles ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">{t("planner.drive.connecting")}</span>
          </div>
        ) : hasFetchError ? (
          /* Error State — API thật báo lỗi, không âm thầm rơi về mock data */
          <div className="p-6 text-center space-y-3">
            <div className="flex justify-end">
              <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <HardDrive className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">{t("planner.drive.connect_title")}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {t("planner.drive.connect_desc")}
              </p>
            </div>
            <Button
              onClick={() => fetchFiles()}
              className="w-full h-9 text-xs font-bold rounded-xl gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </Button>
          </div>
        ) : !isConnected ? (
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-md">
              <HardDrive className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-foreground">{t("planner.drive.connect_title")}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {t("planner.drive.connect_desc")}
              </p>
            </div>

            <Button
              disabled={isConnecting}
              onClick={handleConnectDrive}
              className="w-full h-9 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("planner.drive.connecting")}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("planner.drive.btn_connect")}</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Connected Google Drive Floating Widget View */
          <div className={`flex flex-col ${variant === "panel" ? "h-full" : "h-[480px]"}`}>
            {/* Header Toolbar */}
            <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                  <HardDrive className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-extrabold text-foreground">Google Drive</span>
                <span className="px-1.5 py-0.2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[9px] font-black tracking-wider uppercase rounded-xs">
                  CONNECTED
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {account?.profilePictureUrl ? (
                    <img
                      src={account.profilePictureUrl}
                      alt={account.displayName || "Google account avatar"}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    (account?.displayName || account?.username || "GD").charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search + Action Bar */}
            <div className="p-2.5 border-b border-border/60 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm Drive..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => fetchFiles()}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                {currentFolder ? (
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Home / My Drive</span>
                  </button>
                ) : (
                  <span>🏠 &gt; HOME</span>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MoveUpRight className="h-3 w-3 text-indigo-500" />
                  Kéo thả tệp
                </span>
              </div>

              {/* HOME view: 4 Folder Cards */}
              {!currentFolder ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-1.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Folder className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">My Drive</h4>
                      <p className="text-[10px] text-muted-foreground">{displayFiles.length} Tệp media</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-1.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Được chia sẻ</h4>
                      <p className="text-[10px] text-muted-foreground">Thư mục dùng chung</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-1.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Star className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Có gắn sao</h4>
                      <p className="text-[10px] text-muted-foreground">Mục quan trọng</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-1.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Gần đây</h4>
                      <p className="text-[10px] text-muted-foreground">Vừa cập nhật</p>
                    </div>
                  </button>
                </div>
              ) : (
                /* FOLDER view: List of Media Files */
                <div className="space-y-2">
                  {displayFiles
                    .filter((f) => (f.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((file) => (
                      <div
                        key={file.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleImportFile(file)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between group ${
                          draggingFile?.id === file.id
                            ? "border-indigo-500 bg-indigo-500/10 scale-95 shadow-md"
                            : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 shrink-0" />
                          {file.url ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <h5 className="text-[11px] font-bold text-foreground truncate group-hover:text-indigo-600">
                              {file.name}
                            </h5>
                            <p className="text-[10px] text-muted-foreground">
                              {file.size || "Drive Media"} • {file.date || "Vừa xong"}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Kéo / Chọn
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Toast Message */}
              {successToast && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-scale-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}
            </div>

            {/* Bottom Drag Banner */}
            {!currentFolder ? (
              <div className="p-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[9px] font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 shrink-0">
                <Info className="h-3 w-3 text-indigo-400 shrink-0" />
                <span>♾️ KÉO THẢ TỆP VÀO LỊCH ĐỂ TỰ ĐỘNG THÊM BÀI ĐĂNG</span>
              </div>
            ) : (
              <div className="p-2.5 border-t border-border/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Kéo tệp trực tiếp vào lịch</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => connect()}
                  className="h-6 px-2.5 text-[10px] font-bold bg-indigo-600 text-white rounded-lg gap-1 shadow-xs"
                >
                  <Upload className="h-3 w-3" />
                  <span>+ Quản lý kết nối</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
