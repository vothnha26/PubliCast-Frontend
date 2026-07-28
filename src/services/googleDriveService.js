import api from "./api"
import { GOOGLE_DRIVE_ENDPOINTS } from "@/constants/googleDrive"

export const googleDriveService = {
  async getFiles(brandId) {
    const res = await api.get(GOOGLE_DRIVE_ENDPOINTS.LIST_FILES, {
      params: { brandId },
    })
    return res.data.data // Unwrap { message, data } envelope in one place
  },

  async downloadFile(brandId, fileId, fileName) {
    const res = await api.post(GOOGLE_DRIVE_ENDPOINTS.DOWNLOAD_FILE, {
      brandId,
      fileId,
      fileName,
    })
    return res.data.data
  },

  async getAuthUrl(brandId) {
    const res = await api.get(GOOGLE_DRIVE_ENDPOINTS.AUTH_URL, {
      // frontendOrigin lets the backend redirect the OAuth callback back to
      // THIS app (publicast-frontend sandbox) instead of its default
      // FRONTEND_URL (the legacy app) — see backend oauth.controller.js.
      params: { brandId, frontendOrigin: window.location.origin },
    })
    return res.data.url // OAuth URL endpoint returns direct { url }
  },
}
