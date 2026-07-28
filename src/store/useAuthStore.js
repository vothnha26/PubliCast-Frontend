import { create } from "zustand"
import { authService } from "../services/auth.service"

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  checkAuth: async () => {
    set({ loading: true })
    try {
      const data = await authService.getProfile()
      set({
        user: data.user || data,
        isAuthenticated: true,
        loading: false,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    }
  },

  login: async (credentials) => {
    set({ loading: true })
    try {
      const data = await authService.login(credentials)
      set({
        user: data.user || data,
        isAuthenticated: true,
        loading: false,
      })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await authService.logout()
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    }
  },
}))
