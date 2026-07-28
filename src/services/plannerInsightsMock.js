// PlannerInsightsPanel (Best Times to Post, tổng bài đăng tháng này...) chưa
// có API backend tương ứng — khác với posts/calendar-events/Google Drive đã
// nối API thật. Giữ mock RIÊNG Ở ĐÂY (không lẫn vào plannerService.js) để rõ
// ràng đây là mock có chủ đích, không phải sót lại quên nối.
export const MOCK_INSIGHTS = {
  totalPostsMonth: 124,
  scheduledMonth: 32,
  bestTimesData: [
    { hour: "12am", score: 25 },
    { hour: "4am", score: 45 },
    { hour: "8am", score: 85 },
    { hour: "12pm", score: 95 },
    { hour: "4pm", score: 70 },
    { hour: "8pm", score: 80 },
    { hour: "11pm", score: 30 },
  ],
  integrations: [
    { id: "gdrive", name: "Google Drive", connected: true },
    { id: "csv", name: "CSV Import", connected: false },
  ],
}
