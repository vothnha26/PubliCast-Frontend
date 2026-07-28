export const CALENDAR_EVENT_ENDPOINTS = Object.freeze({
  LIST: "/calendar-events",
  IMPORT_ICS: "/calendar-events/import-ics",
  EXPORT_ICS: "/calendar-events/export-ics",
})

// Định dạng file cho Import/Export (ImportSyncModal.jsx). Chỉ ICS có endpoint
// backend thật (đã xác nhận qua Postman) — CSV/PDF/JSON là placeholder UI,
// chưa nối được vì backend chưa có endpoint tương ứng.
export const EXPORT_FORMAT = Object.freeze({
  CSV: "csv",
  ICS: "ics",
  PDF: "pdf",
  JSON: "json",
})

// Khoảng thời gian xuất dữ liệu (ImportSyncModal.jsx export tab).
export const EXPORT_RANGE = Object.freeze({
  WEEK: "week",
  MONTH: "month",
  ALL: "all",
})
