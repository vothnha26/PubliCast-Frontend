import api from "./api"
import { POST_ENDPOINTS } from "@/constants/post"

export const postService = {
  async createPost(payload) {
    const res = await api.post(POST_ENDPOINTS.CREATE, payload)
    return res.data.data // Unwrap { message, data } envelope in one place
  },
}
