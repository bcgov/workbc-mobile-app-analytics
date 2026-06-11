import { timingSafeEqual } from 'node:crypto'
import type { MiddlewareHandler } from 'hono'

function decodeBasicAuth(
  authorization: string | undefined,
): { username: string; password: string } | undefined {
  if (authorization === undefined || !authorization.startsWith('Basic ')) {
    return undefined
  }

  const encoded = authorization.slice('Basic '.length).trim()
  if (encoded === '') {
    return undefined
  }

  let decoded: string
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return undefined
  }

  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) {
    return undefined
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  }
}

function stringsMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) {
    return false
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

function credentialsMatch(
  provided: { username: string; password: string },
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  return (
    stringsMatch(provided.username, expectedUsername) &&
    stringsMatch(provided.password, expectedPassword)
  )
}

export function createRequireBasicAuth(
  expectedUsername: string,
  expectedPassword: string,
): MiddlewareHandler {
  return async (c, next) => {
    const provided = decodeBasicAuth(c.req.header('Authorization'))
    if (
      provided === undefined ||
      !credentialsMatch(provided, expectedUsername, expectedPassword)
    ) {
      return c.text('Unauthorized', 401, {
        'WWW-Authenticate': 'Basic realm="WorkBC Analytics Summary"',
      })
    }
    await next()
  }
}
