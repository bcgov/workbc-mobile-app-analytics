import type { ParsedEventPayload } from '../schemas/events.js'
import {
  extractProperties,
  parseIsoDate,
  parseIsAuthenticated,
  parseNonEmptyString,
  parsePlatform,
  parseUuid,
} from './promotedFieldParsers.js'

export type EventEnvelope = {
  id: string
  receivedAt: string
}

export type EventInsertRow = {
  id: string
  eventName: string
  sessionId: string | null
  platform: string | null
  clientOccurredAt: Date | null
  isAuthenticated: boolean | null
  screenName: string | null
  properties: Record<string, unknown>
  receivedAt: Date
}

const PROMOTED_PROPERTY_KEYS = new Set([
  'sessionId',
  'platform',
  'timestamp',
  'isAuthenticated',
  'screenName',
])

export function mapEventRow(
  payload: ParsedEventPayload,
  envelope: EventEnvelope,
): EventInsertRow {
  const properties = payload.properties ?? {}
  const receivedAt = new Date(envelope.receivedAt)

  return {
    id: envelope.id,
    eventName: payload.eventName,
    sessionId: parseUuid(properties.sessionId),
    platform: parsePlatform(properties.platform),
    clientOccurredAt: parseIsoDate(properties.timestamp),
    isAuthenticated: parseIsAuthenticated(properties.isAuthenticated),
    screenName: parseNonEmptyString(properties.screenName),
    properties: extractProperties(properties, PROMOTED_PROPERTY_KEYS),
    receivedAt,
  }
}
