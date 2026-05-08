import { randomUUID } from 'node:crypto'
import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../config/env.js'
import type { Logger } from '../lib/logger.js'

export function requestLogMiddleware(
  log: Logger,
  env: AppEnv,
): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.req.header('x-request-id') ?? randomUUID()
    const start = performance.now()
    await next()
    const durationMs = Math.round(performance.now() - start)
    const status = c.res.status
    const base = {
      msg: 'http_request',
      requestId,
      method: c.req.method,
      path: c.req.path,
      status,
      durationMs,
      nodeEnv: env.nodeEnv,
    }
    log.info(base)
    if (status >= 500) {
      log.error({ ...base, msg: 'http_server_error' })
    }
  }
}
