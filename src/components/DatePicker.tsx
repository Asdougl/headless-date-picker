import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react'

type ButtonProps = {
  current: boolean
  diffMonth: boolean
  isWeekend: boolean
  today: boolean
}

interface DatePickerClassCategories {
  input?: string
  container?: string
  grid?: string
  gridRow?: string
  buttons?: (props: ButtonProps) => string
  dayLabel?: string
}

interface HeaderComponentProps {
  month: Date
  next: () => void
  prev: () => void
  setMonth: (date: Date) => void
}

export type HeaderComponent = FC<HeaderComponentProps>

export const MONTH_OPTIONS = [
  <option key={0} value={0}>
    January
  </option>,
  <option key={1} value={1}>
    February
  </option>,
  <option key={2} value={2}>
    March
  </option>,
  <option key={3} value={3}>
    April
  </option>,
  <option key={4} value={4}>
    May
  </option>,
  <option key={5} value={5}>
    June
  </option>,
  <option key={6} value={6}>
    July
  </option>,
  <option key={7} value={7}>
    August
  </option>,
  <option key={8} value={8}>
    September
  </option>,
  <option key={9} value={9}>
    October
  </option>,
  <option key={10} value={10}>
    November
  </option>,
  <option key={11} value={11}>
    December
  </option>,
]

interface DatePickerProps {
  id?: string
  value: Date | undefined
  onChange: (date: Date) => void
  header: HeaderComponent
  classNameConfig?: DatePickerClassCategories
  format?: (date: Date) => string
  min?: Date
  max?: Date
  mondayStart?: boolean
  isMobile?: boolean
  testing?: boolean
}

const padZero = (num: number) => {
  return num < 10 ? `0${num}` : `${num}`
}

const stdFormat = (date: Date) =>
  `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
    date.getDate()
  )}`

const areSame = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const isBefore = (date1: Date, date2: Date) => {
  return date1.getTime() < date2.getTime()
}

const isAfter = (date1: Date, date2: Date) => {
  return date1.getTime() > date2.getTime()
}

const isDisabled = (test: Date, min?: Date, max?: Date) => {
  if (max && isAfter(test, max)) {
    return true
  }
  if (min && isBefore(test, min)) {
    return true
  }
  return false
}

const DAYS_OF_WEEK_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getMonthDates = (year: number, month: number, sundayStart: boolean) => {
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

  for (let i = 0; i < weeks; i++) {
    rows[i] = []
    for (let j = 0; j < 7; j++) {
      rows[i][j] = new Date(focusDay)
      focusDay.setDate(focusDay.getDate() + 1)
    }
  }

  return rows
}

const getInitialFocus = () => {
  const date = new Date()
  date.setDate(1)
  return date
}

export const DatePicker = ({
  id,
  value,
  onChange,
  classNameConfig,
  format,
  header: Header,
  min,
  max,
  mondayStart = false,
  isMobile,
  testing,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [focusMonth, setFocusMonth] = useState(getInitialFocus())
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const todayRef = useRef<HTMLButtonElement | null>(null)

  const monthDates = useMemo(() => {
    return getMonthDates(
      focusMonth.getFullYear(),
      focusMonth.getMonth(),
      !mondayStart
    )
  }, [focusMonth])

  useEffect(() => {
    let handleClickOutside: null | ((event: MouseEvent) => void) = null

    if (open) {
      handleClickOutside = (event: MouseEvent) => {
        if (
          pickerRef.current &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      if (handleClickOutside) {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [open])

  const change = (chosen: Date) => {
    onChange(new Date(chosen))
  }

  const today = new Date()

  const nextMonth = () => {
    focusMonth.setMonth(focusMonth.getMonth() + 1)
    setFocusMonth(new Date(focusMonth))
  }

  const prevMonth = () => {
    focusMonth.setMonth(focusMonth.getMonth() - 1)
    setFocusMonth(new Date(focusMonth))
  }

  const onFocus = () => {
    setOpen(true)
    if (todayRef.current) {
      inputRef.current?.blur()
      todayRef.current.focus()
    }
  }

  const defaultValue = value
    ? format
      ? format(value)
      : value.toLocaleDateString()
    : undefined

  const daysOfWeek = mondayStart ? DAYS_OF_WEEK_MON : DAYS_OF_WEEK_SUN

  return (
    <>
      {isMobile || testing ? (
        <input
          id={id}
          type="date"
          value={value ? stdFormat(value) : ''}
          onChange={(e) => onChange(new Date(e.currentTarget.value))}
          className={classNameConfig?.input}
          min={min ? stdFormat(min) : undefined}
          max={max ? stdFormat(max) : undefined}
        />
      ) : (
        <input
          id={id}
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          onFocus={onFocus}
          className={classNameConfig?.input}
        />
      )}
      <div
        className={classNameConfig?.container}
        ref={pickerRef}
        style={{
          display: open ? 'block' : 'none',
          position: 'absolute',
          top:
            (inputRef.current?.offsetTop || 0) +
            (inputRef.current?.offsetHeight || 0),
          left: inputRef.current?.offsetLeft,
        }}
      >
        <Header
          month={focusMonth}
          setMonth={(date) => setFocusMonth(new Date(date))}
          prev={prevMonth}
          next={nextMonth}
        />
        <div className={classNameConfig?.grid}>
          {daysOfWeek.map((day) => (
            <div key={day} className={classNameConfig?.dayLabel}>
              {day}
            </div>
          ))}
          {monthDates.map((row, index) =>
            row.map((date) => (
              <button
                ref={areSame(date, today) ? todayRef : undefined}
                disabled={isDisabled(date, min, max)}
                key={stdFormat(date)}
                aria-labelledby={stdFormat(date)}
                className={classNameConfig?.buttons?.({
                  current: value ? areSame(value, date) : false,
                  diffMonth: date.getMonth() !== focusMonth.getMonth(),
                  isWeekend: date.getDay() === 0 || date.getDay() === 6,
                  today: areSame(date, new Date()),
                })}
                onClick={() => change(date)}
              >
                {new Date(date).getDate()}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
