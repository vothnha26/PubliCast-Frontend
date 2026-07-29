export const POST_ENDPOINTS = Object.freeze({
  LIST: "/posts",
  CREATE: "/posts",
  BEST_TIMES: "/posts/best-times",
  // v2 (backend/src/routes/workspace/post.routes.v2.js) — same logic as v1
  // (postService.getPlatformLimits / processUploadedFile / createPost), just
  // the {message, data} envelope. v1 endpoints still exist for other callers;
  // this composer path is migrated to v2 as the app moves that direction.
  // CREATE_V2 additionally accepts networkOverrides (see PostNetworkOverride)
  // — v1 CREATE silently ignores that field, so it's not just an envelope
  // change here, it's required for per-network customization to persist.
  PLATFORM_LIMITS: "/v2/posts/platform-limits",
  UPLOAD: "/v2/posts/upload",
  CREATE_V2: "/v2/posts",
})

// POST /v2/posts/upload contract (backend/src/routes/workspace/post.routes.v2.js +
// resolve-post-upload-limits.middleware.js) — these two string values are the
// wire format, not business logic, but they must match backend's
// upload.single('video') field name and req.query.targetPlatforms exactly,
// so they're named here instead of inlined to avoid silent drift.
export const POST_UPLOAD_FORM_FIELD = "video"
export const POST_UPLOAD_QUERY_PARAM = Object.freeze({
  BRAND_ID: "brandId",
  TARGET_PLATFORMS: "targetPlatforms",
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

// Khớp enum PostStatus thật ở backend/prisma/schema.prisma (10 giá trị: DRAFT,
// SCHEDULED, PENDING_APPROVAL, APPROVED, PUBLISHED, PUBLISHING, RETRYING,
// FAILED, REJECTED, PAUSED) — chỉ liệt kê các giá trị FE thực sự set khi tạo
// bài viết mới (không phải trạng thái do BE tự chuyển, vd PUBLISHING/RETRYING).
export const POST_CREATE_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
})

// Khớp enum PostType thật ở backend/prisma/schema.prisma (IMAGE, VIDEO,
// CAROUSEL, REEL, STORY, SHORT, THREAD, PIN, TIKTOK_CAROUSEL, LINK, TEXT,
// LIVE_VIDEO, ALBUM) — chỉ liệt kê các giá trị composer thực sự có thể set
// (xem constants/postComposer.js POST_FORMAT_TO_POST_TYPE và
// usePostComposerFacade's mapPostFormatToPostType).
export const POST_TYPE = Object.freeze({
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  CAROUSEL: "CAROUSEL",
  REEL: "REEL",
  STORY: "STORY",
  SHORT: "SHORT",
  TEXT: "TEXT",
})
