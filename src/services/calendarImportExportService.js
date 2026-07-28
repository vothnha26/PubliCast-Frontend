import api from "./api"
import { CALENDAR_EVENT_ENDPOINTS } from "@/constants/calendarEvent"

export const calendarImportExportService = {
  // Multipart upload — field 'file' PHẢI đứng trước 'brandId' trong FormData:
  // backend đọc req.body.brandId qua checkPermission chạy SAU multer, nhưng
  // multer chỉ parse xong khi field text đến sau field file trong cùng
  // request (đã xác nhận qua Postman — xem calendar-event.routes.js:33).
  async importIcs(brandId, file) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("brandId", brandId)

    const res = await api.post(CALENDAR_EVENT_ENDPOINTS.IMPORT_ICS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data // {message, data: CalendarEvent[]}
  },

  // Export trả file .ics binary trực tiếp (Content-Type: text/calendar), KHÔNG
  // phải JSON — cần responseType 'blob' để axios không cố parse JSON, rồi tự
  // trigger download qua thẻ <a> tạm (browser không tự hỏi "Save As" cho XHR/
  // fetch response — chỉ document navigation mới có hộp thoại đó).
  async exportIcs(brandId, startDate, endDate) {
    const res = await api.get(CALENDAR_EVENT_ENDPOINTS.EXPORT_ICS, {
      params: { brandId, startDate, endDate },
      responseType: "blob",
    })

    const blob = new Blob([res.data], { type: "text/calendar" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `publicast-planner-${startDate}-to-${endDate}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
