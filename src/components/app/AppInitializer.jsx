import React, { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useNavigate } from "react-router-dom"

export const AppInitializer = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()

    const handleSessionExpired = () => {
      useAuthStore.setState({ user: null, isAuthenticated: false, loading: false })
      navigate("/login", { replace: true })
    }

    window.addEventListener("SESSION_EXPIRED", handleSessionExpired)
    return () => {
      window.removeEventListener("SESSION_EXPIRED", handleSessionExpired)
    }
  }, [checkAuth, navigate])

  return children
}
