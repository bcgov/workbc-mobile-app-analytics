import type pg from 'pg'
import type { ErrorInsertRow } from './mapErrorRow.js'

const INSERT_ERROR_SQL = `
INSERT INTO analytics.errors (
  id, error_type, error_name, error_message, session_id, platform,
  client_occurred_at, component_stack, properties, received_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`

export type ErrorsRepository = {
  insertError: (row: ErrorInsertRow) => Promise<void>
}

export function createErrorsRepository(pool: pg.Pool): ErrorsRepository {
  return {
    insertError: (row) => insertError(pool, row),
  }
}

async function insertError(
  pool: pg.Pool,
  row: ErrorInsertRow,
): Promise<void> {
  await pool.query(INSERT_ERROR_SQL, [
    row.id,
    row.errorType,
    row.errorName,
    row.errorMessage,
    row.sessionId,
    row.platform,
    row.clientOccurredAt,
    row.componentStack,
    JSON.stringify(row.properties),
    row.receivedAt,
  ])
}
