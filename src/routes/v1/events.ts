import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'
import type {
  EventsErrorBody,
  EventsSuccessBody,
} from '../../schemas/events.js'
import { parseEventsBody } from '../../schemas/events.js'

export const eventsRoute = new Hono()

eventsRoute.use('*', requireJsonContentType)

eventsRoute.post('/pinning-error', async (c) => {
  try {
    const parsedJson = await c.req.json()
    console.log('Pinning error received: ', parsedJson)
    return c.json({ success: true })
  } catch (e: unknown) {
    console.log('Pinning endpoint error: ', e)
    return c.json({ success: false })
  }
})

eventsRoute.post('/', async (c) => {
  let parsedJson: unknown
  try {
    parsedJson = await c.req.json()
  } catch {
    const body: EventsErrorBody = {
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Body must be valid JSON',
      },
    }
    return c.json(body, 400)
  }

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
