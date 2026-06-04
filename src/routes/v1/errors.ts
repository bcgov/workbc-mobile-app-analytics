import { Hono } from 'hono'
import {
  type EventsVariables,
  parseJsonBody,
} from '../../middleware/parseJsonBody.js'
import { createRequireApiKey } from '../../middleware/requireApiKey.js'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'

export function createErrorsRoute(apiKey: string) {
  const errorsRoute = new Hono<{ Variables: EventsVariables }>()

  errorsRoute.use('*', createRequireApiKey(apiKey))
  errorsRoute.use('*', requireJsonContentType)
  errorsRoute.use('*', parseJsonBody)

  errorsRoute.post('/pinning', async (c) => {
    const parsedJson = c.get('parsedJson')
    console.log('Pinning error received: ', parsedJson)
    return c.json({ success: true })
  })

  return errorsRoute
}
