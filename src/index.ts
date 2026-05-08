import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { loadEnv } from './config/env.js'
import { createLogger } from './lib/logger.js'

const env = loadEnv()
const log = createLogger(env)
const app = createApp(env, log)

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
