import { Hono } from 'hono'

/** Liveness: process is up and serving. */
export const healthRoute = new Hono()
healthRoute.get('/health', (c) =>
  c.json({
    status: 'ok',
  }),
)

/**
 * Readiness: no external dependencies yet; returns 200 with a documented alias
 * until databases or queues are wired (see IMPLEMENTATION_PLAN Session 3).
 */
healthRoute.get('/ready', (c) =>
  c.json({
    status: 'ready',
    dependencies: 'none',
    note: 'No external checks; equivalent to liveness until dependencies exist.',
  }),
)
