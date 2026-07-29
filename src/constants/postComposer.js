// Sentinel network-tab id for the "shared/general" caption tab in the
// composer's edit-by-network view (ContentComposerRegion.jsx) — distinct from
// any SOCIAL_PLATFORM id, since it represents "no specific network selected."
export const NETWORK_TAB_TEMPLATE = "TEMPLATE"

export const SOCIAL_PLATFORM = Object.freeze({
  BLUESKY: "BLUESKY",
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  THREADS: "THREADS",
  TIKTOK: "TIKTOK",
  YOUTUBE: "YOUTUBE",
})

export const POST_FORMATS = Object.freeze({
  POST: { id: "POST", label: "Post", icon: "FileText" },
  REEL: { id: "REEL", label: "Reel", icon: "Video" },
  STORY: { id: "STORY", label: "Story", icon: "Clock" },
  VIDEO: { id: "VIDEO", label: "Video", icon: "Film" },
  SHORT: { id: "SHORT", label: "Shorts", icon: "Play" },
  CAROUSEL: { id: "CAROUSEL", label: "Carousel", icon: "Images" },
})

export const TARGET_PLATFORMS = Object.freeze({
  BLUESKY: {
    id: "BLUESKY",
    name: "Bluesky",
    iconName: "Bluesky",
    color: "#0085FF",
    allowedFormats: ["POST"],
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  FACEBOOK: {
    id: "FACEBOOK",
    name: "Facebook",
    iconName: "Facebook",
    color: "#1877F2",
    allowedFormats: ["POST", "REEL", "STORY"],
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  INSTAGRAM: {
    id: "INSTAGRAM",
    name: "Instagram",
    iconName: "Instagram",
    color: "#E4405F",
    allowedFormats: ["POST", "REEL", "STORY"],
    badgeClass: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  THREADS: {
    id: "THREADS",
    name: "Threads",
    iconName: "Threads",
    color: "#000000",
    allowedFormats: ["POST"],
    badgeClass: "bg-slate-900/10 text-slate-900 dark:text-slate-100 border-slate-900/20",
  },
  TIKTOK: {
    id: "TIKTOK",
    name: "TikTok",
    iconName: "TikTok",
    color: "#000000",
    allowedFormats: ["VIDEO", "POST"],
    badgeClass: "bg-slate-900/15 dark:bg-slate-100/15 text-slate-900 dark:text-slate-100 border-slate-900/40",
  },
  YOUTUBE: {
    id: "YOUTUBE",
    name: "YouTube",
    iconName: "YouTube",
    color: "#FF0000",
    allowedFormats: ["VIDEO", "SHORT"],
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
  },
})

export const PLATFORM_CONSTRAINTS = Object.freeze({
  FACEBOOK: {
    maxCaptionLength: 63206,
    media: {
      image: { maxSizeMB: 10, formats: ["jpg", "jpeg", "png", "webp"] },
      video: { maxSizeMB: 4096, maxDurationSec: 14400, formats: ["mp4", "mov"] },
      reel: { maxSizeMB: 1024, maxDurationSec: 90, aspectRatio: "9:16" },
    },
    rules: { allowCustomThumbnail: true, requireTitle: false },
  },
  INSTAGRAM: {
    maxCaptionLength: 2200,
    media: {
      image: { maxSizeMB: 8, aspectRatioRange: [0.8, 1.91], formats: ["jpg", "jpeg", "png"] },
      reel: { maxSizeMB: 100, maxDurationSec: 900, aspectRatio: "9:16" },
    },
    rules: { allowCustomThumbnail: true, requireMedia: true },
  },
  TIKTOK: {
    maxCaptionLength: 2200,
    media: {
      video: { maxSizeMB: 500, minDurationSec: 3, maxDurationSec: 600, aspectRatio: "9:16" },
    },
    rules: { allowCustomThumbnail: false, requireMedia: true },
  },
  YOUTUBE: {
    maxCaptionLength: 5000,
    maxTitleLength: 100,
    media: {
      video: { maxSizeMB: 262144, maxDurationSec: 43200, formats: ["mp4", "mov", "avi"] },
      short: { maxSizeMB: 2048, maxDurationSec: 60, aspectRatio: "9:16" },
    },
    rules: {
      allowCustomThumbnailShorts: false,
      requireTitle: true,
      minTagsShorts: 3,
    },
  },
  LINKEDIN: {
    maxCaptionLength: 3000,
    media: {
      image: { maxSizeMB: 8, formats: ["jpg", "jpeg", "png"] },
      video: { maxSizeMB: 200, minDurationSec: 3, maxDurationSec: 600 },
    },
    rules: { allowCustomThumbnail: true, requireTitle: false },
  },
  X: {
    maxCaptionLength: 280,
    media: {
      image: { maxSizeMB: 5, formats: ["jpg", "jpeg", "png", "gif"] },
      video: { maxSizeMB: 512, maxDurationSec: 140 },
    },
    rules: { allowCustomThumbnail: true, requireTitle: false },
  },
  TELEGRAM: { maxCaptionLength: 1024 },
  THREADS: { maxCaptionLength: 500 },
  BLUESKY: { maxCaptionLength: 300 },
  TWITCH: { maxCaptionLength: 500 },
  REDDIT: { maxCaptionLength: 40000 },
})

export const POST_TEMPLATES = [
  {
    id: "tpl_product_launch",
    title: "Thông báo ra mắt sản phẩm",
    description: "Giới thiệu tính năng mới nhất của chúng tôi. Bài viết được tối ưu hóa để thu hút sự chú ý và thúc đẩy click.",
    caption: "🚀 Hào hứng thông báo về sản phẩm mới của chúng tôi! Xem ngay video bên dưới để khám phá cách công nghệ mới giúp tối ưu hóa quy trình làm việc. #ProductLaunch #B2BTech #Innovation",
    platforms: ["FACEBOOK", "LINKEDIN"],
    format: "POST",
  },
  {
    id: "tpl_expert_knowledge",
    title: "Chia sẻ kiến thức chuyên ngành",
    description: "Chuỗi bài viết chia sẻ tip, thủ thuật hoặc insight sâu sắc từ dữ liệu ngành. Xây dựng uy tín thương hiệu.",
    caption: "💡 5 Lời khuyên hàng đầu giúp tối ưu hóa chiến lược truyền thông xã hội năm 2026! Bạn đã áp dụng mẹo nào trong số này chưa? Hãy chia sẻ bên dưới nhé 👇 #MarketingTips #SocialStrategy",
    platforms: ["LINKEDIN", "X"],
    format: "POST",
  },
  {
    id: "tpl_monthly_report",
    title: "Báo cáo hiệu suất hàng tháng",
    description: "Mẫu báo cáo số liệu kèm hình ảnh infographic trực quan. Thích hợp cho việc tổng kết cuối tháng.",
    caption: "📊 Tổng kết hiệu suất tháng này: Lượt tương tác tăng 45%, số lượng người theo dõi mới đạt mốc kỷ lục! Cảm ơn sự đồng hành của tất cả các bạn. #MonthlyReport #GrowthMetrics",
    platforms: ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "YOUTUBE"],
    format: "CAROUSEL",
  },
  {
    id: "tpl_minigame_giveaway",
    title: "Minigame / Giveaways",
    description: "Cấu trúc bài đăng tương tác cao với luật chơi rõ ràng và kêu gọi hành động (Call to Action) mạnh mẽ.",
    caption: "🎁 THAM GIA MINIGAME - NHẬN QUÀ KHỦNG!\n1️⃣ Like bài viết này\n2️⃣ Tag 3 người bạn ở phần bình luận\n3️⃣ Chia sẻ bài viết ở chế độ công khai!\nKết quả sẽ công bố vào Thứ 6 tuần tới. #Giveaway #Minigame",
    platforms: ["FACEBOOK", "INSTAGRAM"],
    format: "POST",
  },
]
