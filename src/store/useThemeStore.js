import { create } from "zustand"
import { THEME_MODE, THEME_STORAGE_KEY } from "@/constants/theme"

const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved && (saved === THEME_MODE.LIGHT || saved === THEME_MODE.DARK)) {
    return saved
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME_MODE.DARK
    : THEME_MODE.LIGHT
}

const applyThemeClass = (theme) => {
  const root = document.documentElement
  if (theme === THEME_MODE.DARK) {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

const initialTheme = getInitialTheme()
applyThemeClass(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const nextTheme =
        state.theme === THEME_MODE.LIGHT ? THEME_MODE.DARK : THEME_MODE.LIGHT
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      applyThemeClass(nextTheme)
      return { theme: nextTheme }
    }),
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyThemeClass(theme)
    set({ theme })
  },
}))
