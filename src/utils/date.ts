

export const stdFormat = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

export const areSame = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const isBefore = (date1: Date, date2: Date) => {
  return date1.getTime() < date2.getTime()
}

export const isAfter = (date1: Date, date2: Date) => {
  return date1.getTime() > date2.getTime()
}

export const isDisabled = (test: Date, min?: Date, max?: Date) => {
  if (max && isAfter(test, max)) {
    return true
  }
  if (min && isBefore(test, min)) {
    return true
  }
  return false
}

export const DAYS_OF_WEEK_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAYS_OF_WEEK_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const getMonthDates = (year: number, month: number, sundayStart: boolean) => {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  const weeks = Math.ceil(
    (sundayStart
      ? firstOfMonth.getDay() + lastOfMonth.getDate()
      : firstOfMonth.getDay() + 6 + lastOfMonth.getDate()) / 7
  )

  const focusDay = new Date(year, month)
  focusDay.setDate(
    focusDay.getDate() -
      (sundayStart ? focusDay.getDay() : focusDay.getDay() + 1)
  )

  let rows: Date[][] = []

  console.log(weeks)

  for (let i = 0; i < weeks; i++) {
    rows[i] = []
    for (let j = 0; j < 7; j++) {
      rows[i][j] = new Date(focusDay)
      focusDay.setDate(focusDay.getDate() + 1)
    }
  }

  return rows
}