import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Endpoint list excluded from 401 refresh logic to prevent infinite loop
const EXCLUDED_REFRESH_ENDPOINTS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
]

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    const is401 = error.response.status === 401
    const requestUrl = originalRequest.url || ""

    const isExcluded = EXCLUDED_REFRESH_ENDPOINTS.some((endpoint) =>
      requestUrl.includes(endpoint)
    )

    if (is401 && !originalRequest._retry && !isExcluded) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post("/auth/refresh", {}, { withCredentials: true })
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        window.dispatchEvent(new CustomEvent("SESSION_EXPIRED"))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
