import api from "./api"
import { POST_ENDPOINTS } from "@/constants/post"
import { CALENDAR_EVENT_ENDPOINTS } from "@/constants/calendarEvent"

// Backend GET /posts trả scheduledAt (ISO string), platforms (mảng), status
// chữ thường ("draft") — khác shape mà PostCard/WeekHourlyView cần (date,
// hour, platform số ít, status IN HOA). Map 1 lần ở đây, các component
// không cần biết đến shape API thật.
function mapApiPostToPlannerPost(apiPost) {
  const scheduled = apiPost.scheduledAt ? new Date(apiPost.scheduledAt) : null
  const year = scheduled?.getFullYear()
  const month = scheduled ? String(scheduled.getMonth() + 1).padStart(2, "0") : null
  const day = scheduled ? String(scheduled.getDate()).padStart(2, "0") : null

  return {
    id: apiPost.id,
    title: apiPost.title,
    platform: apiPost.platforms?.[0] || null,
    status: (apiPost.status || "").toUpperCase(),
    type: apiPost.type || null, // GET /posts hiện chưa trả field này (xem post.controller.js) — có thể null
    date: scheduled ? `${year}-${month}-${day}` : null,
    hour: scheduled ? scheduled.getHours() : null,
    timeLabel: scheduled
      ? scheduled.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "",
    thumbnail: apiPost.thumbnail || apiPost.mediaUrls?.[0] || null,
  }
}

export const plannerService = {
  // startDate/endDate (YYYY-MM-DD) lọc theo scheduledAt — BE hỗ trợ sẵn
  // (backend/src/services/workspace/post/filters/date-range.filter.js).
  // Luôn truyền khoảng ngày cụ thể (1 tháng) thay vì limit=100 cố định, để
  // không bỏ sót post khi brand có nhiều hơn 100 post trong lịch sử.
  async getScheduledPosts(brandId, startDate, endDate) {
    const res = await api.get(POST_ENDPOINTS.LIST, {
      params: { brandId, startDate, endDate, limit: 200 },
    })
    const rawPosts = res.data.data || []
    return rawPosts.map(mapApiPostToPlannerPost)
  },

  async getCalendarEvents(brandId, startDate, endDate) {
    const res = await api.get(CALENDAR_EVENT_ENDPOINTS.LIST, {
      params: { brandId, startDate, endDate },
    })
    return res.data.data || []
  },

  // Backend trả mảng 168 ô { day: 0-6, hour: 0-23, percentage } (heatmap
  // tuần), không có khái niệm "top slot" sẵn — FE tự rút gọn về 1 điểm/giờ
  // (lấy percentage cao nhất trong ngày cho mỗi giờ) để vẽ chart hiện có.
  async getBestTimes(brandId, platform) {
    const res = await api.get(POST_ENDPOINTS.BEST_TIMES, { params: { brandId, platform } })
    const slots = res.data.data || []

    const bestPercentageByHour = new Map()
    for (const slot of slots) {
      const current = bestPercentageByHour.get(slot.hour) ?? 0
      if (slot.percentage > current) bestPercentageByHour.set(slot.hour, slot.percentage)
    }

    return Array.from(bestPercentageByHour.entries())
      .sort(([hourA], [hourB]) => hourA - hourB)
      .map(([hour, score]) => ({
        hour: hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`,
        score: Math.round(score),
      }))
  },
}
