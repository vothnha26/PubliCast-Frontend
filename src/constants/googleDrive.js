export const GOOGLE_DRIVE_ENDPOINTS = Object.freeze({
  LIST_FILES: "/v2/social/google/drive/files",
  DOWNLOAD_FILE: "/v2/social/google/drive/download",
  AUTH_URL: "/social/google/url",
})

export const DRIVE_FOLDER_CATEGORY = Object.freeze({
  MY_DRIVE: "my-drive",
  SHARED: "shared",
  STARRED: "starred",
  RECENT: "recent",
})

export const DRIVE_FILE_MIME_GROUP = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  PDF: "pdf",
})

export const DRIVE_STATUS = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  CONNECTED: "connected",
  NOT_CONNECTED: "not_connected",
  ERROR: "error",
})
