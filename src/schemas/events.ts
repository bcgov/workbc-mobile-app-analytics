export type EventsSuccessBody = {
  ok: true
  id: string
  receivedAt: string
}

export type EventsErrorBody = {
  ok: false
  error: {
    code: EventsErrorCode
    message: string
    fields?: Record<string, string>
  }
}

export type EventsErrorCode =
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'UNAUTHORIZED'

export type ParsedEventPayload = {
  eventName: string
  /** Optional arbitrary client metadata (object only). */
  properties?: Record<string, unknown>
}

const BODY_META_KEYS = new Set(['eventName', 'properties'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function topLevelEventProperties(
  body: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => !BODY_META_KEYS.has(key)),
  )
}

export function parseEventsBody(
  raw: unknown,
):
  | { ok: true; value: ParsedEventPayload }
  | { ok: false; message: string; fields?: Record<string, string> } {
  if (!isRecord(raw)) {
    return { ok: false, message: 'Request body must be a JSON object' }
  }

  const body = raw
  const eventName = body.eventName

  if (eventName === undefined || eventName === null) {
    return {
      ok: false,
      message: 'eventName is required',
      fields: { eventName: 'required' },
    }
  }
  if (typeof eventName !== 'string' || eventName.trim() === '') {
    return {
      ok: false,
      message: 'eventName must be a non-empty string',
      fields: { eventName: 'invalid' },
    }
  }

  const fromTopLevel = topLevelEventProperties(body)

  let properties: Record<string, unknown> | undefined
  if (body.properties !== undefined) {
    if (!isRecord(body.properties)) {
      return {
        ok: false,
        message: 'properties must be a JSON object when provided',
        fields: { properties: 'invalid' },
      }
    }
    properties = {
      ...fromTopLevel,
      ...body.properties,
    }
  } else if (Object.keys(fromTopLevel).length > 0) {
    properties = fromTopLevel
  }

  return {
    ok: true,
    value: { eventName: eventName.trim(), properties },
  }
}
