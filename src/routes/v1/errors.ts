import { Hono } from 'hono'
import {
  type EventsVariables,
  parseJsonBody,
} from '../../middleware/parseJsonBody.js'
import { requireJsonContentType } from '../../middleware/requireJsonContentType.js'

export const errorsRoute = new Hono<{ Variables: EventsVariables }>()

errorsRoute.use('*', requireJsonContentType)
errorsRoute.use('*', parseJsonBody)

errorsRoute.post('/pinning', async (c) => {
  const parsedJson = c.get('parsedJson')
  console.log('Pinning error received: ', parsedJson)
  return c.json({ success: true })
})
