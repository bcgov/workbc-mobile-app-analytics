import { Hono } from 'hono'
import type { AppEnv } from './config/env.js'
import type { Logger } from './lib/logger.js'
import { requestLogMiddleware } from './middleware/requestLog.js'
import { healthRoute } from './routes/health.js'
import { errorsRoute } from './routes/v1/errors.js'
import { eventsRoute } from './routes/v1/events.js'

export function createApp(env: AppEnv, log: Logger): Hono {
  const app = new Hono()

  app.use('*', requestLogMiddleware(log, env))

  app.route('/', healthRoute)

  const v1 = new Hono()
  v1.route('/events', eventsRoute)
  v1.route('/errors', errorsRoute)
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
