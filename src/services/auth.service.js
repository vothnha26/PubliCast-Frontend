import api from "./api"

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },
  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },
  getProfile: async () => {
    // Route thật là /user/profile (backend/src/routes/auth/profile.routes.js:36),
    // KHÔNG phải /auth/me — endpoint đó không tồn tại (404).
    const response = await api.get("/user/profile")
    return response.data
  },
}
