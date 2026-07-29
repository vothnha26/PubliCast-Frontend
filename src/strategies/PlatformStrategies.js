import { SOCIAL_PLATFORM } from "@/constants/postComposer"

// postFormat (composer UI) -> PlatformLimit.subType (backend DB) — identical
// for every value except YOUTUBE's SHORT, which the DB stores as SHORTS
// (plural). See backend prisma PlatformLimit rows.
const POST_FORMAT_TO_SUBTYPE = { SHORT: "SHORTS" }
const toSubType = (postFormat) => POST_FORMAT_TO_SUBTYPE[postFormat] || postFormat

/**
 * Base Strategy Interface
 */
export class BasePlatformStrategy {
  constructor(platformId, name, maxCharacters, maxHashtags, allowedPostTypes) {
    this.platformId = platformId
    this.name = name
    this.maxCharacters = maxCharacters
    this.maxHashtags = maxHashtags
    this.allowedPostTypes = allowedPostTypes
  }

  validate(caption = "", mediaUrls = [], postFormat = "POST", extra = {}) {
    const errors = []
    const charCount = caption.length
    const hashtagCount = (caption.match(/#[^\s#]+/g) || []).length

    // Character limit check
    if (charCount > this.maxCharacters) {
      errors.push({
        id: `${this.platformId}-char-limit`,
        platform: this.platformId,
        field: "caption",
        targetId: "input-composer-caption",
        message: `${this.name}: Vượt quá giới hạn ký tự (${charCount}/${this.maxCharacters})`,
        severity: "error",
      })
    }

    // Hashtag limit check
    if (hashtagCount > this.maxHashtags) {
      errors.push({
        id: `${this.platformId}-hashtag-limit`,
        platform: this.platformId,
        field: "caption",
        targetId: "input-composer-caption",
        message: `${this.name}: Số lượng hashtag (${hashtagCount}) vượt mốc tối đa (${this.maxHashtags})`,
        severity: "warning",
      })
    }

    errors.push(...this.validateMediaFiles(postFormat, extra))

    return errors
  }

  /**
   * Checks each pendingFile (raw File objects, not yet uploaded — see
   * usePostComposerFacade's pendingFiles) against the real PlatformLimit row
   * for this platform+postFormat, fetched once via
   * postService.getPlatformLimits and passed in as extra.platformLimits.
   * Runs entirely client-side on File.size/File.type — no upload happens
   * here, so a file can be rejected before ever reaching Cloudinary.
   */
  validateMediaFiles(postFormat, extra = {}) {
    const { pendingFiles = [], platformLimits = [] } = extra
    if (pendingFiles.length === 0 || platformLimits.length === 0) return []

    const subType = toSubType(postFormat)
    const limit = platformLimits.find((l) => l.platform === this.platformId && l.subType === subType)
    if (!limit) return []

    const allowedFormats = limit.allowedFormats.split(",").map((f) => f.trim().toLowerCase())
    const errors = []

    pendingFiles.forEach((file) => {
      const sizeMb = file.size / (1024 * 1024)
      const ext = file.name.split(".").pop()?.toLowerCase()

      if (sizeMb > limit.maxFileSizeMb) {
        errors.push({
          id: `${this.platformId}-media-size-${file.name}`,
          platform: this.platformId,
          field: "media",
          targetId: "input-media-dropzone",
          message: `${this.name}: Tệp "${file.name}" (${sizeMb.toFixed(1)}MB) vượt quá giới hạn ${limit.maxFileSizeMb}MB.`,
          severity: "error",
        })
      }
      if (ext && !allowedFormats.includes(ext)) {
        errors.push({
          id: `${this.platformId}-media-format-${file.name}`,
          platform: this.platformId,
          field: "media",
          targetId: "input-media-dropzone",
          message: `${this.name}: Định dạng ".${ext}" không được hỗ trợ. Định dạng hợp lệ: ${allowedFormats.join(", ")}.`,
          severity: "error",
        })
      }
    })

    return errors
  }
}

/**
 * Bluesky Strategy
 */
export class BlueskyStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.BLUESKY, "Bluesky", 300, 30, ["POST"])
  }
}

/**
 * Facebook Strategy
 */
export class FacebookStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.FACEBOOK, "Facebook", 63206, 30, ["POST", "REEL", "STORY"])
  }
}

/**
 * Instagram Strategy
 */
export class InstagramStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.INSTAGRAM, "Instagram", 2200, 30, ["POST", "REEL", "STORY"])
  }

  validate(caption = "", mediaUrls = [], postFormat = "POST", extra = {}) {
    const errors = super.validate(caption, mediaUrls, postFormat, extra)
    if (mediaUrls.length === 0) {
      errors.push({
        id: "INSTAGRAM-require-media",
        platform: SOCIAL_PLATFORM.INSTAGRAM,
        field: "media",
        targetId: "input-media-dropzone",
        message: "Instagram: Yêu cầu bắt buộc đính kèm ít nhất 1 hình ảnh hoặc video",
        severity: "error",
      })
    }
    return errors
  }
}

/**
 * YouTube Strategy
 */
export class YouTubeStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.YOUTUBE, "YouTube", 5000, 15, ["VIDEO", "SHORT"])
  }

  validate(caption = "", mediaUrls = [], postFormat = "VIDEO", extra = {}) {
    const errors = super.validate(caption, mediaUrls, postFormat, extra)
    const youtubeOptions = extra.youtubeOptions || {}
    if (!youtubeOptions.title && !caption) {
      errors.push({
        id: "YOUTUBE-require-title",
        platform: SOCIAL_PLATFORM.YOUTUBE,
        field: "title",
        targetId: "input-youtube-title",
        message: "YouTube: Video bắt buộc phải có Tiêu đề (Video Title)",
        severity: "error",
      })
    }
    if (mediaUrls.length === 0) {
      errors.push({
        id: "YOUTUBE-require-media",
        platform: SOCIAL_PLATFORM.YOUTUBE,
        field: "media",
        targetId: "input-media-dropzone",
        message: "YouTube: Bắt buộc chọn tệp video đính kèm",
        severity: "error",
      })
    }
    return errors
  }
}

/**
 * TikTok Strategy
 */
export class TikTokStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.TIKTOK, "TikTok", 2200, 30, ["VIDEO", "POST"])
  }

  validate(caption = "", mediaUrls = [], postFormat = "VIDEO", extra = {}) {
    const errors = super.validate(caption, mediaUrls, postFormat, extra)
    if (mediaUrls.length === 0) {
      errors.push({
        id: "TIKTOK-require-media",
        platform: SOCIAL_PLATFORM.TIKTOK,
        field: "media",
        targetId: "input-media-dropzone",
        message: "TikTok: Bắt buộc chọn video để đăng tải",
        severity: "error",
      })
    }
    return errors
  }
}

/**
 * Threads Strategy
 */
export class ThreadsStrategy extends BasePlatformStrategy {
  constructor() {
    super(SOCIAL_PLATFORM.THREADS, "Threads", 500, 30, ["POST"])
  }
}

/**
 * Strategy Registry (Factory for Strategies)
 */
export const PlatformStrategyRegistry = {
  [SOCIAL_PLATFORM.BLUESKY]: new BlueskyStrategy(),
  [SOCIAL_PLATFORM.FACEBOOK]: new FacebookStrategy(),
  [SOCIAL_PLATFORM.INSTAGRAM]: new InstagramStrategy(),
  [SOCIAL_PLATFORM.YOUTUBE]: new YouTubeStrategy(),
  [SOCIAL_PLATFORM.TIKTOK]: new TikTokStrategy(),
  [SOCIAL_PLATFORM.THREADS]: new ThreadsStrategy(),

  getStrategy(platformId) {
    return this[platformId] || new BasePlatformStrategy(platformId, platformId, 2000, 30, ["POST"])
  },
}
