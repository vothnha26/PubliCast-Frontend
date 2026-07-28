import { create } from "zustand"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM, FILTER_ALL } from "@/constants/planner"
import { plannerService } from "@/services/plannerService"

export const useContentPlanner = create((set, get) => ({
  viewMode: CALENDAR_VIEW_MODE.WEEK_HOURLY,
  currentDate: new Date(2026, 10, 20), // Nov 20, 2026
  selectedPlatforms: Object.keys(SOCIAL_PLATFORM),
  selectedStatuses: Object.keys(POST_STATUS),
  selectedTypes: Object.keys(POST_TYPE),
  filterStatus: FILTER_ALL,
  filterType: FILTER_ALL,
  searchQuery: "",
  posts: [],
  insights: null,
  isLoading: false,

  setViewMode: (viewMode) => set({ viewMode }),

  setCurrentDate: (currentDate) => set({ currentDate }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setFilterType: (filterType) => set({ filterType }),

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

  toggleStatus: (statusId) => {
    set((state) => {
      const isSelected = state.selectedStatuses.includes(statusId)
      const newStatuses = isSelected
        ? state.selectedStatuses.filter((s) => s !== statusId)
        : [...state.selectedStatuses, statusId]
      return { selectedStatuses: newStatuses }
    })
  },

  selectAllStatuses: () => {
    set({ selectedStatuses: Object.keys(POST_STATUS) })
  },

  toggleType: (typeId) => {
    set((state) => {
      const isSelected = state.selectedTypes.includes(typeId)
      const newTypes = isSelected
        ? state.selectedTypes.filter((t) => t !== typeId)
        : [...state.selectedTypes, typeId]
      return { selectedTypes: newTypes }
    })
  },

  selectAllTypes: () => {
    set({ selectedTypes: Object.keys(POST_TYPE) })
  },

  resetAllFilters: () => {
    set({
      selectedPlatforms: Object.keys(SOCIAL_PLATFORM),
      selectedStatuses: Object.keys(POST_STATUS),
      selectedTypes: Object.keys(POST_TYPE),
      filterStatus: FILTER_ALL,
      filterType: FILTER_ALL,
      searchQuery: "",
    })
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
    const { posts, selectedPlatforms, selectedStatuses, selectedTypes, filterStatus, filterType, searchQuery } = get()
    let result = posts

    if (selectedPlatforms && selectedPlatforms.length > 0 && selectedPlatforms.length < Object.keys(SOCIAL_PLATFORM).length) {
      result = result.filter((post) => selectedPlatforms.includes(post.platform))
    }

    if (selectedStatuses && selectedStatuses.length > 0 && selectedStatuses.length < Object.keys(POST_STATUS).length) {
      result = result.filter((post) => selectedStatuses.includes(post.status))
    } else if (filterStatus && filterStatus !== FILTER_ALL) {
      result = result.filter((post) => post.status === filterStatus)
    }

    if (selectedTypes && selectedTypes.length > 0 && selectedTypes.length < Object.keys(POST_TYPE).length) {
      result = result.filter((post) => selectedTypes.includes(post.type))
    } else if (filterType && filterType !== FILTER_ALL) {
      result = result.filter((post) => post.type === filterType)
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((post) => post.title?.toLowerCase().includes(query))
    }

    return result
  },
}))
