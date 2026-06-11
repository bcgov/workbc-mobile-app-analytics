import { describe, expect, it } from 'vitest'
import { getVisitorDayRanges } from '../src/lib/vancouverDayBounds.js'

describe('getVisitorDayRanges', () => {
  it('returns Vancouver calendar day bounds for today, 7 days, and 30 days', () => {
    const referenceDate = new Date('2026-06-11T18:30:00.000Z')
    const ranges = getVisitorDayRanges(referenceDate)

    expect(ranges.today).toEqual({
      start: '2026-06-11T07:00:00.000Z',
      end: '2026-06-12T07:00:00.000Z',
    })
    expect(ranges.last7Days).toEqual({
      start: '2026-06-05T07:00:00.000Z',
      end: '2026-06-12T07:00:00.000Z',
    })
    expect(ranges.last30Days).toEqual({
      start: '2026-05-13T07:00:00.000Z',
      end: '2026-06-12T07:00:00.000Z',
    })
  })
})
