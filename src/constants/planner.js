// Giá trị "không lọc theo field này" dùng chung cho filterStatus/filterType —
// khai báo 1 nơi duy nhất để tránh gõ tay chuỗi "ALL" rải rác (dễ gõ sai/lệch
// chính tả, lỗi sẽ im lặng vì so sánh chuỗi không match thay vì báo lỗi rõ ràng).
export const FILTER_ALL = "ALL"

// Khớp đúng enum PostStatus thật ở backend/prisma/schema.prisma (10 giá trị:
// DRAFT, SCHEDULED, PENDING_APPROVAL, APPROVED, PUBLISHED, PUBLISHING, RETRYING,
// FAILED, REJECTED, PAUSED). Chỉ đưa vào đây các trạng thái mà bản gốc
// (frontend cũ/PlannerToolbar.jsx) thực sự cho lọc — không bịa thêm badge cho
// các trạng thái nội bộ ít gặp trên UI (APPROVED, PUBLISHING, RETRYING, REJECTED,
// PAUSED). Nếu sau này cần hiện đủ, thêm entry mới ở đây, id phải khớp enum.
export const POST_STATUS = Object.freeze({
  DRAFT: {
    id: "DRAFT",
    labelKey: "planner.status.draft",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  SCHEDULED: {
    id: "SCHEDULED",
    labelKey: "planner.status.scheduled",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  PENDING_APPROVAL: {
    id: "PENDING_APPROVAL",
    labelKey: "planner.status.pending_approval",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  PUBLISHED: {
    id: "PUBLISHED",
    labelKey: "planner.status.published",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  FAILED: {
    id: "FAILED",
    labelKey: "planner.status.failed",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
})

// Khớp subset của enum PostType thật (14 giá trị ở schema.prisma) mà bản gốc
// (PlannerToolbar.jsx) thực sự cho lọc — ALL/IMAGE/VIDEO/CAROUSEL.
export const POST_TYPE = Object.freeze({
  IMAGE: { id: "IMAGE", labelKey: "planner.type.image" },
  VIDEO: { id: "VIDEO", labelKey: "planner.type.video" },
  CAROUSEL: { id: "CAROUSEL", labelKey: "planner.type.carousel" },
})

export const CALENDAR_VIEW_MODE = Object.freeze({
  WEEK_HOURLY: "WEEK_HOURLY",
  WEEK_COMPACT: "WEEK_COMPACT",
  MONTH: "MONTH",
  DAY: "DAY",
  LIST: "LIST",
})

// iconName khớp đúng tên platform mà PlatformIcon (src/components/shared/PlatformIcon.jsx)
// nhận diện — dùng chung 1 nguồn cho mọi nơi hiển thị icon platform (filter pills, PostCard...).
export const SOCIAL_PLATFORM = Object.freeze({
  YOUTUBE: {
    id: "YOUTUBE",
    name: "YouTube",
    iconName: "YouTube",
    dotClass: "bg-red-600",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  FACEBOOK: {
    id: "FACEBOOK",
    name: "Facebook",
    iconName: "Facebook",
    dotClass: "bg-blue-600",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  INSTAGRAM: {
    id: "INSTAGRAM",
    name: "Instagram",
    iconName: "Instagram",
    dotClass: "bg-pink-600",
    badgeClass: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  TIKTOK: {
    id: "TIKTOK",
    name: "TikTok",
    iconName: "TikTok",
    dotClass: "bg-slate-900 dark:bg-slate-100",
    // Đậm hơn bản gốc (/10 -> /15, /20 -> /40) vì tông đen/xám trung tính của TikTok
    // dễ "chìm" trên nền trắng so với các platform còn lại dùng màu sắc rực — cần độ
    // tương phản cao hơn để nhận biết ngay là đang ở trạng thái "đã chọn".
    badgeClass: "bg-slate-900/15 dark:bg-slate-100/15 text-slate-900 dark:text-slate-100 border-slate-900/40 dark:border-slate-100/40",
  },
  THREADS: {
    id: "THREADS",
    name: "Threads",
    iconName: "Threads",
    dotClass: "bg-slate-700",
    badgeClass: "bg-slate-700/10 text-slate-700 border-slate-700/20",
  },
  X: {
    id: "X",
    name: "X (Twitter)",
    iconName: "X",
    dotClass: "bg-slate-800",
    badgeClass: "bg-slate-800/10 text-slate-800 border-slate-800/20",
  },
})
