import type { MiddlewareHandler } from 'hono'
import type { EventsErrorBody } from '../schemas/events.js'

export type EventsVariables = {
  parsedJson: unknown
}

export const parseJsonBody: MiddlewareHandler<{
  Variables: EventsVariables
}> = async (c, next) => {
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
  c.set('parsedJson', parsedJson)
  await next()
}
