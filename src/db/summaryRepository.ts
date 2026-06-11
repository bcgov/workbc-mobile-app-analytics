import type pg from 'pg'
import {
  getVisitorDayRanges,
  type DayBounds,
} from '../lib/vancouverDayBounds.js'

export type TopPage = {
  screenName: string
  views: number
}

export type SummaryMetrics = {
  uniqueVisitorsToday: number
  uniqueVisitorsLast7Days: number
  uniqueVisitorsLast30Days: number
  authenticatedEvents: number
  notAuthenticatedEvents: number
  totalErrors: number
  topPages: TopPage[]
}

export type SummaryRepository = {
  getSummaryMetrics: () => Promise<SummaryMetrics>
}

const UNIQUE_VISITORS_SQL = `
SELECT COUNT(DISTINCT session_id)::int AS count
FROM analytics.events
WHERE session_id IS NOT NULL
  AND client_occurred_at >= $1
  AND client_occurred_at < $2
`

const AUTH_SPLIT_SQL = `
SELECT
  COUNT(*) FILTER (WHERE is_authenticated = true)::int AS authenticated,
  COUNT(*) FILTER (WHERE is_authenticated IS NOT true)::int AS not_authenticated
FROM analytics.events
`

const TOTAL_ERRORS_SQL = `
SELECT COUNT(*)::int AS count
FROM analytics.errors
`

const TOP_PAGES_SQL = `
SELECT screen_name, COUNT(*)::int AS views
FROM analytics.events
WHERE event_name = 'screen_view'
  AND screen_name IS NOT NULL
GROUP BY screen_name
ORDER BY views DESC
LIMIT 3
`

export function createSummaryRepository(pool: pg.Pool): SummaryRepository {
  return {
    getSummaryMetrics: () => getSummaryMetrics(pool),
  }
}

async function getSummaryMetrics(pool: pg.Pool): Promise<SummaryMetrics> {
  const ranges = getVisitorDayRanges()

  const [
    uniqueVisitorsToday,
    uniqueVisitorsLast7Days,
    uniqueVisitorsLast30Days,
    authSplit,
    totalErrors,
    topPages,
  ] = await Promise.all([
    countUniqueVisitors(pool, ranges.today),
    countUniqueVisitors(pool, ranges.last7Days),
    countUniqueVisitors(pool, ranges.last30Days),
    getAuthSplit(pool),
    countTotalErrors(pool),
    getTopPages(pool),
  ])

  return {
    uniqueVisitorsToday,
    uniqueVisitorsLast7Days,
    uniqueVisitorsLast30Days,
    authenticatedEvents: authSplit.authenticated,
    notAuthenticatedEvents: authSplit.notAuthenticated,
    totalErrors,
    topPages,
  }
}

async function countUniqueVisitors(
  pool: pg.Pool,
  bounds: DayBounds,
): Promise<number> {
  const result = await pool.query<{ count: number }>(UNIQUE_VISITORS_SQL, [
    bounds.start,
    bounds.end,
  ])
  return result.rows[0]?.count ?? 0
}

async function getAuthSplit(
  pool: pg.Pool,
): Promise<{ authenticated: number; notAuthenticated: number }> {
  const result = await pool.query<{
    authenticated: number
    not_authenticated: number
  }>(AUTH_SPLIT_SQL)
  const row = result.rows[0]
  return {
    authenticated: row?.authenticated ?? 0,
    notAuthenticated: row?.not_authenticated ?? 0,
  }
}

async function countTotalErrors(pool: pg.Pool): Promise<number> {
  const result = await pool.query<{ count: number }>(TOTAL_ERRORS_SQL)
  return result.rows[0]?.count ?? 0
}

async function getTopPages(pool: pg.Pool): Promise<TopPage[]> {
  const result = await pool.query<{ screen_name: string; views: number }>(
    TOP_PAGES_SQL,
  )
  return result.rows.map((row) => ({
    screenName: row.screen_name,
    views: row.views,
  }))
}
