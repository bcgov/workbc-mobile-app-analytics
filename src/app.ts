import { Hono } from 'hono'
import type { AppEnv } from './config/env.js'
import type { ErrorsRepository } from './db/errorsRepository.js'
import type { EventsRepository } from './db/eventsRepository.js'
import type { SummaryRepository } from './db/summaryRepository.js'
import type { Logger } from './lib/logger.js'
import { requestLogMiddleware } from './middleware/requestLog.js'
import { healthRoute } from './routes/health.js'
import { createErrorsRoute } from './routes/v1/errors.js'
import { createEventsRoute } from './routes/v1/events.js'
import { createSummaryRoute } from './routes/v1/summary.js'

export type AppDeps = {
  events: EventsRepository
  errors: ErrorsRepository
  summary: SummaryRepository
}

export function createApp(env: AppEnv, log: Logger, deps: AppDeps): Hono {
  const app = new Hono()

  app.use('*', requestLogMiddleware(log, env))

  app.route('/', healthRoute)

  const v1 = new Hono()
  v1.route(
    '/events',
    createEventsRoute({
      apiKey: env.apiKey,
      insertEvent: deps.events.insertEvent,
      log,
    }),
  )
  v1.route(
    '/errors',
    createErrorsRoute({
      apiKey: env.apiKey,
      insertError: deps.errors.insertError,
      log,
    }),
  )
  v1.route(
    '/summary',
    createSummaryRoute({
      summaryUsername: env.summaryUsername,
      summaryPassword: env.summaryPassword,
      getSummaryMetrics: deps.summary.getSummaryMetrics,
      log,
    }),
  )
  app.route('/v1', v1)

  app.onError((err, c) => {
    log.error({
      msg: 'unhandled_error',
      err: { name: err.name, message: err.message, stack: err.stack },
      method: c.req.method,
      path: c.req.path,
    })
    const message =
      env.nodeEnv === 'development'
        ? err.message
        : 'An unexpected error occurred'
    return c.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      },
      500,
    )
  })

  return app
}
