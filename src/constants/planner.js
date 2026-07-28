export const POST_STATUS = Object.freeze({
  PUBLISHED: {
    id: "PUBLISHED",
    labelKey: "planner.status.published",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  SCHEDULED: {
    id: "SCHEDULED",
    labelKey: "planner.status.scheduled",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  DRAFTING: {
    id: "DRAFTING",
    labelKey: "planner.status.drafting",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  FAILED: {
    id: "FAILED",
    labelKey: "planner.status.failed",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
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
