import { Hono } from 'hono'
import type { SummaryMetrics } from '../../db/summaryRepository.js'
import type { Logger } from '../../lib/logger.js'
import { createRequireBasicAuth } from '../../middleware/requireBasicAuth.js'
import { renderSummaryPage } from '../../views/summaryPage.js'

export type SummaryRouteDeps = {
  summaryUsername: string
  summaryPassword: string
  getSummaryMetrics: () => Promise<SummaryMetrics>
  log?: Logger
}

export function createSummaryRoute(deps: SummaryRouteDeps) {
  const summaryRoute = new Hono()

  summaryRoute.use(
    '*',
    createRequireBasicAuth(deps.summaryUsername, deps.summaryPassword),
  )

  summaryRoute.get('/', async (c) => {
    try {
      const metrics = await deps.getSummaryMetrics()
      return c.html(renderSummaryPage(metrics))
    } catch (err) {
      deps.log?.error({
        msg: 'summary_metrics_failed',
        err:
          err instanceof Error
            ? { name: err.name, message: err.message, stack: err.stack }
            : { message: String(err) },
      })
      throw err
    }
  })

  return summaryRoute
}
