import { create } from "zustand"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM } from "@/constants/planner"
import { plannerService } from "@/services/plannerService"

export const useContentPlanner = create((set, get) => ({
  viewMode: CALENDAR_VIEW_MODE.WEEK_HOURLY,
  currentDate: new Date(2026, 10, 20), // Nov 20, 2026 for demonstration matching img5
  selectedPlatforms: Object.keys(SOCIAL_PLATFORM), // All selected by default
  posts: [],
  insights: null,
  isLoading: false,

  setViewMode: (viewMode) => set({ viewMode }),

  togglePlatform: (platformId) => {
    set((state) => {
      const isSelected = state.selectedPlatforms.includes(platformId)
      const newPlatforms = isSelected
        ? state.selectedPlatforms.filter((p) => p !== platformId)
        : [...state.selectedPlatforms, platformId]
      return { selectedPlatforms: newPlatforms }
    })
  },

  selectAllPlatforms: () => {
    set({ selectedPlatforms: Object.keys(SOCIAL_PLATFORM) })
  },

  navigateDate: (direction) => {
    set((state) => {
      const newDate = new Date(state.currentDate)
      if (direction === "today") {
        return { currentDate: new Date() }
      }
      if (state.viewMode === CALENDAR_VIEW_MODE.MONTH) {
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
      } else {
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
      }
      return { currentDate: newDate }
    })
  },

  fetchPlannerData: async () => {
    set({ isLoading: true })
    try {
      const [postsData, insightsData] = await Promise.all([
        plannerService.getScheduledPosts(),
        plannerService.getInsights(),
      ])
      set({ posts: postsData, insights: insightsData, isLoading: false })
    } catch (err) {
      console.error("Failed to fetch planner data", err)
      set({ isLoading: false })
    }
  },

  getFilteredPosts: () => {
    const { posts, selectedPlatforms } = get()
    if (!selectedPlatforms || selectedPlatforms.length === 0) {
      return posts
    }
    return posts.filter((post) => selectedPlatforms.includes(post.platform))
  },
}))
