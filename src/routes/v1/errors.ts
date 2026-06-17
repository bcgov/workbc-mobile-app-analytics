import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { mapErrorRow } from '../../db/mapErrorRow.js'
import type { ErrorInsertRow } from '../../db/mapErrorRow.js'
import type { Logger } from '../../lib/logger.js'
import {
  type EventsVariables,
  parseJsonBody,
} from '../../middleware/parseJsonBody.js'
import { createRequireApiKey } from '../../middleware/requireApiKey.js'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'
import type { EventsErrorBody } from '../../schemas/events.js'
import type { ErrorsSuccessBody } from '../../schemas/errors.js'
import { parseErrorsBody } from '../../schemas/errors.js'

export type ErrorsRouteDeps = {
  apiKey: string
  insertError: (row: ErrorInsertRow) => Promise<void>
  log?: Logger
}

export function createErrorsRoute(deps: ErrorsRouteDeps) {
  const errorsRoute = new Hono<{ Variables: EventsVariables }>()

  errorsRoute.use('*', createRequireApiKey(deps.apiKey))
  errorsRoute.use('*', requireJsonContentType)
  errorsRoute.use('*', parseJsonBody)

  errorsRoute.post('/', async (c) => {
    const parsedJson = c.get('parsedJson')

    const result = parseErrorsBody(parsedJson)
    if (!result.ok) {
      const body: EventsErrorBody = {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.message,
          ...(result.fields ? { fields: result.fields } : {}),
        },
      }
      return c.json(body, 400)
    }

    deps.log?.debug({
      msg: 'error_parsed',
      errorType: result.value.type,
      errorName: result.value.errorName,
      propertyKeys: Object.keys(result.value.properties ?? {}),
    })

    const envelope = buildAcceptedEnvelope()
    const row = mapErrorRow(result.value, envelope)
    await deps.insertError(row)

    const body: ErrorsSuccessBody = {
      ok: true,
      id: envelope.id,
      receivedAt: envelope.receivedAt,
    }
    return c.json(body, 202)
  })

  return errorsRoute
}

function buildAcceptedEnvelope(): { id: string; receivedAt: string } {
  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  }
}
