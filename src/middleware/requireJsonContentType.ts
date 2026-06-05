import type { MiddlewareHandler } from 'hono'
import type { EventsErrorBody } from '../schemas/events.js'
import { jsonErrorResponse } from './responseError.js'

export const requireJsonContentType: MiddlewareHandler = async (c, next) => {
  const contentType = (c.req.header('content-type') ?? '').toLowerCase()
  if (contentType !== '' && !contentType.includes('application/json')) {
    const body: EventsErrorBody = {
      ok: false,
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type must be application/json',
      },
    }
    return jsonErrorResponse(c, body, 415)
  }
  await next()
}
