import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import {
  type EventsVariables,
  parseJsonBody,
} from '../../middleware/parseJsonBody.js'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'
import type {
  EventsErrorBody,
  EventsSuccessBody,
} from '../../schemas/events.js'
import { parseEventsBody } from '../../schemas/events.js'

export const eventsRoute = new Hono<{ Variables: EventsVariables }>()

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

  // TODO: Implement event processing

  const envelope = buildAcceptedEnvelope()
  const body: EventsSuccessBody = {
    ok: true,
    id: envelope.id,
    receivedAt: envelope.receivedAt,
  }
  return c.json(body, 202)
})

function buildAcceptedEnvelope(): { id: string; receivedAt: string } {
  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  }
}
