import api from "./api"
import { POST_ENDPOINTS, POST_UPLOAD_FORM_FIELD, POST_UPLOAD_QUERY_PARAM } from "@/constants/post"

export const postService = {
  async createPost(payload) {
    const res = await api.post(POST_ENDPOINTS.CREATE_V2, payload)
    return res.data.data // Unwrap { message, data } envelope in one place
  },

  // Flat array of every PlatformLimit row (all platforms/subTypes) — used to
  // pre-validate a File's size/format client-side against the real limit for
  // the platforms+format currently selected in the composer, before it's
  // ever uploaded. See usePostComposerFacade's platformLimits state.
  async getPlatformLimits() {
    const res = await api.get(POST_ENDPOINTS.PLATFORM_LIMITS)
    return res.data.data // Unwrap { message, data } envelope in one place
  },

  // targetPlatforms narrows server-side per-platform size/format enforcement
  // (see resolvePostUploadLimits) to the platforms currently selected in the
  // composer; sizeMb/duration/format in the response are real values read
  // from Cloudinary, not client-estimated.
  async uploadMedia(brandId, targetPlatforms, file) {
    const formData = new FormData()
    formData.append(POST_UPLOAD_FORM_FIELD, file)

    const params = new URLSearchParams({ [POST_UPLOAD_QUERY_PARAM.BRAND_ID]: brandId })
    if (targetPlatforms?.length > 0) {
      params.set(POST_UPLOAD_QUERY_PARAM.TARGET_PLATFORMS, targetPlatforms.join(","))
    }

    const res = await api.post(`${POST_ENDPOINTS.UPLOAD}?${params.toString()}`, formData, {
      timeout: 120000,
    })
    return res.data.data // Unwrap { message, data } envelope in one place
  },

  async trimVideo(payload) {
    const res = await api.post(POST_ENDPOINTS.TRIM_VIDEO, payload)
    return res.data
  },

  async getTrimStatus(taskId) {
    const res = await api.get(POST_ENDPOINTS.TRIM_STATUS(taskId))
    return res.data
  },
}
