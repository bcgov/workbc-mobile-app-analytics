import type { ParsedEventPayload } from '../schemas/events.js'

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseUuid(value: unknown): string | null {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    return null
  }
  return value
}

function parsePlatform(value: unknown): string | null {
  if (value === 'ios' || value === 'android') {
    return value
  }
  return null
}

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

function parseIsAuthenticated(value: unknown): boolean | null {
  if (value === true || value === 'true') {
    return true
  }
  if (value === false || value === 'false') {
    return false
  }
  return null
}

function parseNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function extractEventProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key]) => !PROMOTED_PROPERTY_KEYS.has(key),
    ),
  )
}

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
    properties: extractEventProperties(properties),
    receivedAt,
  }
}
