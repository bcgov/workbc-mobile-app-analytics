import { timingSafeEqual } from 'node:crypto'
import type { MiddlewareHandler } from 'hono'
import type { EventsErrorBody } from '../schemas/events.js'

function getProvidedApiKey(getHeader: (name: string) => string | undefined): string | undefined {
  const xApiKey = getHeader('X-API-Key')
  if (xApiKey !== undefined && xApiKey !== '') {
    return xApiKey
  }

  const authorization = getHeader('Authorization')
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim()
    return token === '' ? undefined : token
  }

  return undefined
}

function keysMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) {
    return false
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export function createRequireApiKey(expectedKey: string): MiddlewareHandler {
  return async (c, next) => {
    const provided = getProvidedApiKey((name) => c.req.header(name))
    if (provided === undefined || !keysMatch(provided, expectedKey)) {
      const body: EventsErrorBody = {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Valid API key is required',
        },
      }
      return c.json(body, 401)
    }
    await next()
  }
}
