import type { ParsedErrorPayload } from '../schemas/errors.js'
import {
  extractProperties,
  parseIsoDate,
  parseNonEmptyString,
  parsePlatform,
  parseUuid,
} from './promotedFieldParsers.js'

export type ErrorEnvelope = {
  id: string
  receivedAt: string
}

export type ErrorInsertRow = {
  id: string
  errorType: string
  errorName: string
  errorMessage: string
  sessionId: string | null
  platform: string | null
  clientOccurredAt: Date | null
  componentStack: string | null
  properties: Record<string, unknown>
  receivedAt: Date
}

const PROMOTED_PROPERTY_KEYS = new Set([
  'type',
  'errorMessage',
  'errorName',
  'componentStack',
  'platform',
  'timestamp',
  'sessionId',
])

export function mapErrorRow(
  payload: ParsedErrorPayload,
  envelope: ErrorEnvelope,
): ErrorInsertRow {
  const properties = payload.properties ?? {}
  const receivedAt = new Date(envelope.receivedAt)

  return {
    id: envelope.id,
    errorType: payload.type,
    errorName: payload.errorName,
    errorMessage: payload.errorMessage,
    sessionId: parseUuid(payload.sessionId),
    platform: parsePlatform(payload.platform),
    clientOccurredAt: parseIsoDate(payload.timestamp),
    componentStack: parseNonEmptyString(payload.componentStack),
    properties: extractProperties(properties, PROMOTED_PROPERTY_KEYS),
    receivedAt,
  }
}
