export const POST_ENDPOINTS = Object.freeze({
  LIST: "/posts",
  CREATE: "/posts",
  BEST_TIMES: "/posts/best-times",
})

// Khớp danh sách platform mà GET /posts/best-times hỗ trợ thật ở backend
// (backend/src/services/workspace/post.service.js:943) — không phải toàn bộ
// SOCIAL_PLATFORM trong constants/planner.js, chỉ subset này.
export const BEST_TIMES_SUPPORTED_PLATFORMS = Object.freeze([
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "FACEBOOK",
])

// Khớp enum PostStatus thật ở backend/prisma/schema.prisma. MinimalPostCreatorModal
// luôn tạo post ở DRAFT — status khác (SCHEDULED, PUBLISHED...) kích hoạt
// validationFacade.validatePost nghiêm ngặt ở BE (yêu cầu targetPlatforms/options
// hợp lệ) mà bản tối giản (chưa có UI chọn platform) không đáp ứng được.
export const POST_CREATE_STATUS = Object.freeze({
  DRAFT: "DRAFT",
})
