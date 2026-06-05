import type { Context } from 'hono'
import type { EventsErrorBody } from '../schemas/events.js'

export type ResponseError = EventsErrorBody['error']

export type ResponseErrorVariables = {
  responseError?: ResponseError
}

export function setResponseError(c: Context, error: ResponseError): void {
  c.set('responseError', error)
}

export function jsonErrorResponse(
  c: Context,
  body: EventsErrorBody,
  status: 400 | 401 | 415,
) {
  setResponseError(c, body.error)
  return c.json(body, status)
}
