import { create } from "zustand"
import { CALENDAR_VIEW_MODE, SOCIAL_PLATFORM, POST_STATUS, POST_TYPE, FILTER_ALL } from "@/constants/planner"
import { plannerService } from "@/services/plannerService"
import { MOCK_INSIGHTS } from "@/services/plannerInsightsMock"
import { getMonthKey, getMonthDateRange } from "@/utils/dateUtils"

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
  // Tháng nào (key "YYYY-MM") đã fetch rồi thì không gọi lại API — Week/Day/
  // Month view đều đọc chung 1 mảng `posts` này, chỉ khác cách lọc hiển thị.
  // Tránh vừa giới hạn cứng kiểu limit=100 (thiếu dữ liệu nếu brand có nhiều
  // post) vừa tránh gọi API lại mỗi lần chuyển tuần/tháng trong cùng 1 tháng.
  fetchedMonths: new Set(),
  currentBrandId: null,
  insights: null,
  isLoading: false,
  isInsightsOpen: true,

  toggleInsights: () => set((state) => ({ isInsightsOpen: !state.isInsightsOpen })),
  setIsInsightsOpen: (isInsightsOpen) => set({ isInsightsOpen }),

  setViewMode: (viewMode) => set({ viewMode }),

  setCurrentDate: (currentDate) => {
    set({ currentDate })
    get().ensureMonthsLoadedForCurrentView()
  },

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
    get().ensureMonthsLoadedForCurrentView()
  },

  // Đảm bảo mọi tháng mà view hiện tại (Week/Day/Month) có thể chạm tới đã
  // được fetch. Week view có thể vắt sang tháng liền kề (VD tuần cuối tháng 11
  // có ngày đầu tháng 12) nên luôn xét cả currentDate-3 ngày và +3 ngày để
  // chắc chắn bắt được tháng liền kề khi cần, không chỉ riêng currentDate.
  ensureMonthsLoadedForCurrentView: async () => {
    const { currentDate, currentBrandId, fetchMonth } = get()
    if (!currentBrandId) return
    const before = new Date(currentDate)
    before.setDate(before.getDate() - 3)
    const after = new Date(currentDate)
    after.setDate(after.getDate() + 3)

    const refDatesByMonthKey = new Map([
      [getMonthKey(before), before],
      [getMonthKey(currentDate), currentDate],
      [getMonthKey(after), after],
    ])
    await Promise.all(
      Array.from(refDatesByMonthKey.values()).map((refDate) => fetchMonth(currentBrandId, refDate))
    )
  },

  // Fetch 1 tháng cụ thể nếu chưa có trong cache (fetchedMonths), merge kết
  // quả vào `posts` theo id (tránh trùng lặp nếu post nào đó vô tình được
  // trả về ở nhiều lần fetch tháng khác nhau — không nên xảy ra nhưng an toàn).
  fetchMonth: async (brandId, date) => {
    const monthKey = getMonthKey(date)
    if (get().fetchedMonths.has(monthKey)) return

    set((state) => ({ fetchedMonths: new Set(state.fetchedMonths).add(monthKey) }))
    try {
      const [startDate, endDate] = getMonthDateRange(date)
      const monthPosts = await plannerService.getScheduledPosts(brandId, startDate, endDate)
      set((state) => {
        const existingIds = new Set(state.posts.map((p) => p.id))
        const newPosts = monthPosts.filter((p) => !existingIds.has(p.id))
        return { posts: [...state.posts, ...newPosts] }
      })
    } catch (err) {
      console.error(`Failed to fetch posts for month ${monthKey}`, err)
      // Bỏ đánh dấu đã fetch để lần sau còn thử lại tháng này.
      set((state) => {
        const next = new Set(state.fetchedMonths)
        next.delete(monthKey)
        return { fetchedMonths: next }
      })
    }
  },

  fetchPlannerData: async (brandId) => {
    if (!brandId) {
      set({ posts: [], fetchedMonths: new Set(), currentBrandId: null, insights: MOCK_INSIGHTS, isLoading: false })
      return
    }

    const isBrandChanged = get().currentBrandId !== brandId
    set({ isLoading: true })
    if (isBrandChanged) {
      // Đổi brand — dữ liệu tháng đã cache thuộc brand cũ không còn đúng.
      set({ posts: [], fetchedMonths: new Set(), currentBrandId: brandId })
    }

    try {
      await get().ensureMonthsLoadedForCurrentView()
      set({ insights: MOCK_INSIGHTS, isLoading: false })
    } catch (err) {
      console.error("Failed to fetch planner data", err)
      set({ isLoading: false })
    }
  },

  // Xoá tháng của `date` khỏi cache rồi fetch lại ngay — dùng sau khi
  // tạo/sửa/xoá post (MinimalPostCreatorModal onSuccess), vì fetchPlannerData
  // một mình sẽ KHÔNG gọi lại API cho tháng đã có trong fetchedMonths.
  refreshMonth: async (brandId, date) => {
    if (!brandId) return
    const monthKey = getMonthKey(date)
    set((state) => {
      const next = new Set(state.fetchedMonths)
      next.delete(monthKey)
      return {
        fetchedMonths: next,
        posts: state.posts.filter((p) => !p.date?.startsWith(monthKey)),
      }
    })
    await get().fetchMonth(brandId, date)
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

    // post.type hiện luôn null với dữ liệu thật từ API (GET /posts chưa trả field
    // này — xem plannerService.js) — filter theo type cụ thể sẽ lọc bỏ hết các
    // post đó cho tới khi backend bổ sung field. Không phải bug ở filter logic.
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
