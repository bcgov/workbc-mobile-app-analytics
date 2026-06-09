import { Hono } from 'hono'

/** Liveness: process is up and serving. */
export const healthRoute = new Hono()

healthRoute.get('/health', (c) =>
  c.json({
    status: 'ok',
  }),
)

healthRoute.get('/ready', (c) =>
  c.json({
    status: 'ready',
  }),
)
