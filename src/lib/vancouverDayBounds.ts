export const VANCOUVER_TIME_ZONE = 'America/Vancouver'

export type DayBounds = {
  start: string
  end: string
}

export type VisitorDayRanges = {
  today: DayBounds
  last7Days: DayBounds
  last30Days: DayBounds
}

const vancouverDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: VANCOUVER_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function getVancouverDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = vancouverDateFormatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)
  return { year, month, day }
}

function addDaysToDateParts(
  parts: { year: number; month: number; day: number },
  days: number,
): { year: number; month: number; day: number } {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  }
}

function getVancouverOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VANCOUVER_TIME_ZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(date)
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = offset.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/)
  if (match === null) {
    return 0
  }

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3] ?? '0')
  return sign * (hours * 60 + minutes) * 60 * 1000
}

function vancouverMidnightToIso(
  parts: { year: number; month: number; day: number },
): string {
  const utcMidnight = Date.UTC(parts.year, parts.month - 1, parts.day)
  const offsetMs = getVancouverOffsetMs(new Date(utcMidnight))
  return new Date(utcMidnight - offsetMs).toISOString()
}

function dayBoundsForVancouverDate(
  parts: { year: number; month: number; day: number },
): DayBounds {
  const start = vancouverMidnightToIso(parts)
  const nextDay = addDaysToDateParts(parts, 1)
  const end = vancouverMidnightToIso(nextDay)
  return { start, end }
}

export function getVisitorDayRanges(referenceDate: Date = new Date()): VisitorDayRanges {
  const todayParts = getVancouverDateParts(referenceDate)
  const last7DaysStart = addDaysToDateParts(todayParts, -6)
  const last30DaysStart = addDaysToDateParts(todayParts, -29)

  return {
    today: dayBoundsForVancouverDate(todayParts),
    last7Days: {
      start: vancouverMidnightToIso(last7DaysStart),
      end: dayBoundsForVancouverDate(todayParts).end,
    },
    last30Days: {
      start: vancouverMidnightToIso(last30DaysStart),
      end: dayBoundsForVancouverDate(todayParts).end,
    },
  }
}
