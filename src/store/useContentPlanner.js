import { create } from "zustand"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM } from "@/constants/planner"
import { plannerService } from "@/services/plannerService"

export const useContentPlanner = create((set, get) => ({
  viewMode: CALENDAR_VIEW_MODE.WEEK_HOURLY,
  currentDate: new Date(2026, 10, 20), // Nov 20, 2026
  selectedPlatforms: Object.keys(SOCIAL_PLATFORM),
  searchQuery: "",
  posts: [],
  insights: null,
  isLoading: false,

  setViewMode: (viewMode) => set({ viewMode }),

  setCurrentDate: (currentDate) => set({ currentDate }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

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
      } else if (state.viewMode === CALENDAR_VIEW_MODE.DAY) {
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
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
    const { posts, selectedPlatforms, searchQuery } = get()
    let result = posts

    if (selectedPlatforms && selectedPlatforms.length > 0) {
      result = result.filter((post) => selectedPlatforms.includes(post.platform))
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((post) => post.title.toLowerCase().includes(query))
    }

    return result
  },
}))
