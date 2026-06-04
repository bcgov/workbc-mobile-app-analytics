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

export function parseEventsBody(
  raw: unknown,
):
  | { ok: true; value: ParsedEventPayload }
  | { ok: false; message: string; fields?: Record<string, string> } {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Request body must be a JSON object' }
  }

  const body = raw as Record<string, unknown>
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

  let properties: Record<string, unknown> | undefined
  if (body.properties !== undefined) {
    if (
      body.properties === null ||
      typeof body.properties !== 'object' ||
      Array.isArray(body.properties)
    ) {
      return {
        ok: false,
        message: 'properties must be a JSON object when provided',
        fields: { properties: 'invalid' },
      }
    }
    properties = body.properties as Record<string, unknown>
  }

  return {
    ok: true,
    value: { eventName: eventName.trim(), properties },
  }
}
