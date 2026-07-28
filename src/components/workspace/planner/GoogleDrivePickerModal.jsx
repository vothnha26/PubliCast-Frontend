import React, { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GoogleDrivePickerModal({ isOpen, onClose, onSelectFile }) {
  const { t } = useTranslation()

  const [isConnected, setIsConnected] = useState(true)
  const [currentFolder, setCurrentFolder] = useState(null) // null = Home, "my-drive" = My Drive folder
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  if (!isOpen) return null

  const handleConnectDrive = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 1200)
  }

  const mockDriveFiles = [
    {
      id: "f1",
      name: "Campaign_Mockup_2026.png",
      type: "image",
      size: "2.4 MB",
      date: "12 Th10, 2026",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    },
    {
      id: "f2",
      name: "Promo_Video_Final.mp4",
      type: "video",
      size: "45.8 MB",
      date: "Vừa xong",
      url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
    },
    {
      id: "f3",
      name: "Strategy_Briefing.pdf",
      type: "pdf",
      size: "842 KB",
      date: "10 Th10, 2026",
      url: null,
    },
    {
      id: "f4",
      name: "Product_Demo_4K.mov",
      type: "video",
      size: "128.5 MB",
      date: "08 Th10, 2026",
      url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80",
    },
  ]

  const handleImportFile = (file) => {
    setSelectedMedia(file)
    setSuccessToast(`Đã chọn "${file.name}" từ Google Drive!`)

    if (onSelectFile) {
      onSelectFile(file)
    }

    setTimeout(() => {
      setSuccessToast(null)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card (Matching Google Drive Widget design in Images 2 & 3) */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-scale-in select-none">
        {/* Unconnected State (Image 1) */}
        {!isConnected ? (
          <div className="p-8 text-center space-y-5">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-md">
              <HardDrive className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-foreground">Connect Google Drive</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Nhập hình ảnh và video bài đăng trực tiếp từ kho lưu trữ Google Drive của bạn.
              </p>
            </div>

            <Button
              disabled={isConnecting}
              onClick={handleConnectDrive}
              className="w-full h-10 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>Connect Drive</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Connected Google Drive Browser View (Image 2 & 3) */
          <div className="flex flex-col h-[520px]">
            {/* Header Toolbar (Image 2 Top) */}
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                  <HardDrive className="h-4 w-4" />
                </div>
                <span className="px-1.5 py-0.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[9px] font-black tracking-wider uppercase rounded-xs">
                  BETA
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                  JD
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
            <div className="p-3 border-b border-border/60 flex items-center gap-2">
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
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                {currentFolder ? (
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Trang chủ</span>
                  </button>
                ) : (
                  <span>🏠 &gt; HOME</span>
                )}
                {currentFolder && <span className="text-foreground">/ My Drive</span>}
              </div>

              {/* HOME view: 4 Folder Cards (Image 2) */}
              {!currentFolder ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: My Drive */}
                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Folder className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">My Drive</h4>
                      <p className="text-[10px] text-muted-foreground">248 Tệp media</p>
                    </div>
                  </button>

                  {/* Card 2: Shared */}
                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Được chia sẻ</h4>
                      <p className="text-[10px] text-muted-foreground">12 Thư mục</p>
                    </div>
                  </button>

                  {/* Card 3: Starred */}
                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Có gắn sao</h4>
                      <p className="text-[10px] text-muted-foreground">42 Mục chọn</p>
                    </div>
                  </button>

                  {/* Card 4: Recent */}
                  <button
                    onClick={() => setCurrentFolder("my-drive")}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 transition-all text-left group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Gần đây</h4>
                      <p className="text-[10px] text-muted-foreground">3 giờ trước</p>
                    </div>
                  </button>
                </div>
              ) : (
                /* FOLDER view: List of Media Files (Image 3) */
                <div className="space-y-2">
                  {mockDriveFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleImportFile(file)}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-muted-foreground shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-foreground truncate group-hover:text-indigo-600">
                            {file.name}
                          </h5>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {file.size} • {file.date}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImportFile(file)
                        }}
                        className="h-7 px-2.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Chọn
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toast Message */}
              {successToast && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-scale-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}
            </div>

            {/* Bottom Floating Bar (Image 2 Bottom Banner) */}
            {!currentFolder ? (
              <div className="p-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 shrink-0">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                <span>CHỌN TỆP ĐỂ CHỌN MEDIA BÀI ĐĂNG TỰ ĐỘNG</span>
              </div>
            ) : (
              /* Folder Footer (Image 3 Bottom) */
              <div className="p-3 border-t border-border/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Đã đồng bộ Drive</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => alert("Mở cửa sổ tải tệp mới lên Google Drive")}
                  className="h-7 px-3 text-xs font-bold bg-indigo-600 text-white rounded-xl gap-1.5 shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>+ Tải tệp lên</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
