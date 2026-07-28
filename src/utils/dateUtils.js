export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const WEEKDAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const MONTH_KEYS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function getWeekDays(currentDate) {
  const curr = new Date(currentDate)
  const dayOfWeek = curr.getDay() // 0 = Sun
  const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(curr)
  monday.setDate(curr.getDate() + distanceToMon)

  const today = new Date()

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const dateNum = String(d.getDate()).padStart(2, "0")
    const fullDate = `${year}-${month}-${dateNum}`

    return {
      dayKey: WEEKDAY_KEYS[d.getDay()],
      date: String(d.getDate()),
      fullDate,
      rawDate: d,
      isToday: isSameDay(d, today),
    }
  })
}

export function formatDateRange(currentDate, viewMode, t) {
  if (!currentDate) return ""

  const monthKey = MONTH_KEYS[currentDate.getMonth()]
  const monthName = t ? t(`planner.months.${monthKey}`) : monthKey

  if (viewMode === "MONTH") {
    return `${monthName}, ${currentDate.getFullYear()}`
  }

  if (viewMode === "DAY") {
    const dayKey = WEEKDAY_KEYS[currentDate.getDay()]
    const dayName = t ? t(`planner.weekdays.${dayKey}`) : dayKey
    return `${dayName}, ${currentDate.getDate()} ${monthName} ${currentDate.getFullYear()}`
  }

  // Week view
  const weekDays = getWeekDays(currentDate)
  const first = weekDays[0].rawDate
  const last = weekDays[6].rawDate

  const firstMonthKey = MONTH_KEYS[first.getMonth()]
  const lastMonthKey = MONTH_KEYS[last.getMonth()]
  const firstMonthName = t ? t(`planner.months.${firstMonthKey}`) : firstMonthKey
  const lastMonthName = t ? t(`planner.months.${lastMonthKey}`) : lastMonthKey

  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} ${firstMonthName}, ${first.getFullYear()}`
  }

  return `${first.getDate()} ${firstMonthName} – ${last.getDate()} ${lastMonthName}, ${first.getFullYear()}`
}
