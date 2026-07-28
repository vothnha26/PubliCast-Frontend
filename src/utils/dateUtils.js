export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function getWeekDays(currentDate) {
  const curr = new Date(currentDate)
  const dayOfWeek = curr.getDay() // 0 = Sun
  // Calculate Monday as start of week (or Sunday depending on locale, let's use Mon-Sun layout)
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
      day: WEEKDAY_NAMES[d.getDay()],
      date: String(d.getDate()),
      fullDate,
      rawDate: d,
      isToday: isSameDay(d, today),
    }
  })
}

export function formatDateRange(currentDate, viewMode) {
  if (!currentDate) return ""

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  if (viewMode === "MONTH") {
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  if (viewMode === "DAY") {
    const dayName = WEEKDAY_NAMES[currentDate.getDay()]
    return `${dayName}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
  }

  // Week view
  const weekDays = getWeekDays(currentDate)
  const first = weekDays[0].rawDate
  const last = weekDays[6].rawDate

  if (first.getMonth() === last.getMonth()) {
    return `${months[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`
  }

  return `${months[first.getMonth()]} ${first.getDate()} – ${months[last.getMonth()]} ${last.getDate()}, ${first.getFullYear()}`
}
