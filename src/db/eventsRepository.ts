import type pg from 'pg'
import type { EventInsertRow } from './mapEventRow.js'

const INSERT_EVENT_SQL = `
INSERT INTO analytics.events (
  id, event_name, session_id, platform, client_occurred_at,
  is_authenticated, screen_name, properties, received_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`

export type EventsRepository = {
  insertEvent: (row: EventInsertRow) => Promise<void>
}

export function createEventsRepository(pool: pg.Pool): EventsRepository {
  return {
    insertEvent: (row) => insertEvent(pool, row),
  }
}

async function insertEvent(
  pool: pg.Pool,
  row: EventInsertRow,
): Promise<void> {
  await pool.query(INSERT_EVENT_SQL, [
    row.id,
    row.eventName,
    row.sessionId,
    row.platform,
    row.clientOccurredAt,
    row.isAuthenticated,
    row.screenName,
    JSON.stringify(row.properties),
    row.receivedAt,
  ])
}
