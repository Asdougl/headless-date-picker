import classNames from 'classnames'
import dayjs, { Dayjs } from 'dayjs'
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
  value: Dayjs | undefined
  onChange: (date: Dayjs) => void
  min?: Dayjs
  max?: Dayjs
  mondayStart?: boolean
  isMobile?: boolean
  testing?: boolean
  placeholder?: string
  closeOnSelect?: boolean
}

const stdFormat = (date: Dayjs) => date.format('YYYY-MM-DD')
const displayFormat = (date: Dayjs) => date.format('D MMM YY')

const isDisabled = (test: Dayjs, min?: Dayjs, max?: Dayjs) => {
  if (max && test.isAfter(max)) {
    return true
  }
  if (min && test.isBefore(min)) {
    return true
  }
  return false
}

const DAYS_OF_WEEK_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getMonthDates = (year: number, month: number, sundayStart: boolean) => {
  const firstOfMonth = dayjs().set('year', year).set('month', month).set('date', 1)
  const lastOfMonth = dayjs().set('year', year).set('month', month + 1).set('date', 0)

  const weeks = Math.ceil(
    (sundayStart
      ? firstOfMonth.get('day') + lastOfMonth.get('date')
      : firstOfMonth.get('day') + 6 + lastOfMonth.get('date')) / 7
  )

  let focusDay = dayjs().set('year', year).set('month', month).set('date', 1)
  focusDay = focusDay.set('date',
    focusDay.get('date') -
      (sundayStart ? focusDay.get('day') : focusDay.get('day') - 1)
  )

  let rows: Dayjs[][] = []
  for (let i = 0; i < weeks; i++) {
    rows[i] = []
    for (let j = 0; j < 7; j++) {
      rows[i][j] = focusDay
      focusDay = focusDay.add(1, 'day')
    }
  }

  return rows
}

const getInitialFocus = () => {
  return dayjs().set('date', 1)
}

export const DatePicker = ({
  id,
  value,
  onChange,
  min,
  max,
  mondayStart = true,
  isMobile,
  testing,
  placeholder,
  closeOnSelect,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [focusMonth, setFocusMonth] = useState(getInitialFocus())
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const todayRef = useRef<HTMLButtonElement | null>(null)

  const monthDates = useMemo(() => {
    return getMonthDates(
      focusMonth.get('year'),
      focusMonth.get('month'),
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

  const change = (chosen: Dayjs) => {
    onChange(chosen.clone())
    if(!chosen.isSame(focusMonth, 'month')) {
      setFocusMonth(focusMonth.set('month', chosen.month()).set('year', chosen.year()))
    }
    if(inputRef.current) inputRef.current.value = displayFormat(chosen)
    if(closeOnSelect) {
      setOpen(false)
    }
  }

  const today = new Date()

  const nextMonth = () => {
    setFocusMonth(focusMonth.set('month', focusMonth.get('month') + 1))
  }

  const prevMonth = () => {
    setFocusMonth(focusMonth.set('month', focusMonth.get('month') - 1))
  }

  const onFocus = () => {
    setOpen(true)
    if (todayRef.current) {
      inputRef.current?.blur()
      todayRef.current.focus()
    }
  }

  const daysOfWeek = mondayStart ? DAYS_OF_WEEK_MON : DAYS_OF_WEEK_SUN

  return (
    <>
      {isMobile || testing ? (
        <input
          id={id}
          type="date"
          value={value ? stdFormat(value) : ''}
          onChange={(e) => onChange(dayjs(e.currentTarget.value))}
          className="border border-blue-500 rounded-lg px-4 py-2"
          min={min ? stdFormat(min) : undefined}
          max={max ? stdFormat(max) : undefined}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          ref={inputRef}
          type="text"
          defaultValue={value ? displayFormat(value) : ''}
          placeholder={placeholder}
          onFocus={onFocus}
          className="border border-blue-500 rounded-lg px-4 py-2"
        />
      )}
      <div
        className="border border-blue-500 shadow-lg px-2 py-1 m-2 rounded-lg bg-white"
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
        <div className="flex justify-between">
          <button onClick={prevMonth}>&lt;</button>
          <select
            value={focusMonth.get('month')}
            onChange={(e) =>
              setFocusMonth(focusMonth.clone().set('month', +e.currentTarget.value))
            }
          >
            {MONTH_OPTIONS}
          </select>
          <input
            type="number"
            min={1901}
            max={2100}
            value={focusMonth.get('year')}
            onChange={(e) =>
              setFocusMonth(focusMonth.clone().set('year', +e.currentTarget.value))
            }
          />
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-red-500 text-center">
              {day}
            </div>
          ))}
          {monthDates.map((row, index) =>
            row.map((date) => {
              const current = value ? value.isSame(date, 'date') : false
              const isToday = date.isSame(today, 'date')
              return (
              <button
                ref={isToday ? todayRef : undefined}
                disabled={isDisabled(date, min, max)}
                key={stdFormat(date)}
                aria-labelledby={stdFormat(date)}
                className={classNames('h-8 w-8 rounded-full disabled:opacity-10 border', {
                  'opacity-60': date.get('month') !== focusMonth.get('month'),
                  'bg-blue-500 text-white border-blue-500': current,
                  'border-blue-500': isToday,
                  'border-transparent': !current && !isToday,
                })}
                onClick={() => change(date)}
              >
                {date.get('date')}
              </button>
            )
            })
          )}
        </div>
      </div>
    </>
  )
}
