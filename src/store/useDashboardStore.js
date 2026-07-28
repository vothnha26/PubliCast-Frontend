import { create } from "zustand"

export const useDashboardStore = create((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}))
