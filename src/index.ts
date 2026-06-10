import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { loadEnv } from './config/env.js'
import { createErrorsRepository } from './db/errorsRepository.js'
import { createEventsRepository } from './db/eventsRepository.js'
import { createPool } from './db/pool.js'
import { createLogger } from './lib/logger.js'

const env = loadEnv()
const log = createLogger(env)
const pool = createPool(env.databaseUrl)

pool.on('error', (err) => {
  log.error({
    msg: 'pool_idle_client_error',
    err: { name: err.name, message: err.message, stack: err.stack },
  })
})

const app = createApp(env, log, {
  events: createEventsRepository(pool),
  errors: createErrorsRepository(pool),
})

function shutdown(): void {
  void pool.end()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    log.info({
      msg: 'server_listen',
      port: info.port,
      nodeEnv: env.nodeEnv,
      logLevel: env.logLevel,
    })
  },
)
