import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { mapEventRow } from '../../db/mapEventRow.js'
import type { Logger } from '../../lib/logger.js'
import {
  type EventsVariables,
  parseJsonBody,
} from '../../middleware/parseJsonBody.js'
import { createRequireApiKey } from '../../middleware/requireApiKey.js'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'
import type {
  EventsErrorBody,
  EventsSuccessBody,
} from '../../schemas/events.js'
import { parseEventsBody } from '../../schemas/events.js'
import type { EventInsertRow } from '../../db/mapEventRow.js'

export type EventsRouteDeps = {
  apiKey: string
  insertEvent: (row: EventInsertRow) => Promise<void>
  log?: Logger
}

export function createEventsRoute(deps: EventsRouteDeps) {
  const eventsRoute = new Hono<{ Variables: EventsVariables }>()

  eventsRoute.use('*', createRequireApiKey(deps.apiKey))
  eventsRoute.use('*', requireJsonContentType)
  eventsRoute.use('*', parseJsonBody)

  eventsRoute.post('/', async (c) => {
    const parsedJson = c.get('parsedJson')

    const result = parseEventsBody(parsedJson)
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
      msg: 'event_parsed',
      eventName: result.value.eventName,
      propertyKeys: Object.keys(result.value.properties ?? {}),
    })

    const envelope = buildAcceptedEnvelope()
    const row = mapEventRow(result.value, envelope)
    await deps.insertEvent(row)

    const body: EventsSuccessBody = {
      ok: true,
      id: envelope.id,
      receivedAt: envelope.receivedAt,
    }
    return c.json(body, 202)
  })

  return eventsRoute
}

function buildAcceptedEnvelope(): { id: string; receivedAt: string } {
  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  }
}
