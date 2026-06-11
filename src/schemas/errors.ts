export type ErrorsSuccessBody = {
  ok: true
  id: string
  receivedAt: string
}

export type ParsedErrorPayload = {
  type: string
  errorMessage: string
  errorName: string
  componentStack?: string
  platform?: string
  timestamp?: string
  sessionId?: string
  /** Optional arbitrary client metadata (object only). */
  properties?: Record<string, unknown>
}

const BODY_META_KEYS = new Set([
  'type',
  'errorMessage',
  'errorName',
  'componentStack',
  'platform',
  'timestamp',
  'sessionId',
  'properties',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function topLevelErrorProperties(
  body: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => !BODY_META_KEYS.has(key)),
  )
}

function parseErrorProperties(
  body: Record<string, unknown>,
  fromTopLevel: Record<string, unknown>,
):
  | { ok: true; properties?: Record<string, unknown> }
  | { ok: false; message: string; fields: Record<string, string> } {
  if (body.properties !== undefined) {
    if (!isRecord(body.properties)) {
      return {
        ok: false,
        message: 'properties must be a JSON object when provided',
        fields: { properties: 'invalid' },
      }
    }
    return {
      ok: true,
      properties: { ...fromTopLevel, ...body.properties },
    }
  }

  if (Object.keys(fromTopLevel).length > 0) {
    return { ok: true, properties: fromTopLevel }
  }

  return { ok: true }
}

function parseRequiredString(
  body: Record<string, unknown>,
  field: 'type' | 'errorMessage' | 'errorName',
):
  | { ok: true; value: string }
  | { ok: false; message: string; fields: Record<string, string> } {
  const raw = body[field]

  if (raw === undefined || raw === null) {
    return {
      ok: false,
      message: `${field} is required`,
      fields: { [field]: 'required' },
    }
  }
  if (typeof raw !== 'string' || raw.trim() === '') {
    return {
      ok: false,
      message: `${field} must be a non-empty string`,
      fields: { [field]: 'invalid' },
    }
  }

  return { ok: true, value: raw.trim() }
}

function parseOptionalString(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export function parseErrorsBody(
  raw: unknown,
):
  | { ok: true; value: ParsedErrorPayload }
  | { ok: false; message: string; fields?: Record<string, string> } {
  if (!isRecord(raw)) {
    return { ok: false, message: 'Request body must be a JSON object' }
  }

  const body = raw

  const typeResult = parseRequiredString(body, 'type')
  if (!typeResult.ok) {
    return typeResult
  }

  const errorMessageResult = parseRequiredString(body, 'errorMessage')
  if (!errorMessageResult.ok) {
    return errorMessageResult
  }

  const errorNameResult = parseRequiredString(body, 'errorName')
  if (!errorNameResult.ok) {
    return errorNameResult
  }

  const fromTopLevel = topLevelErrorProperties(body)
  const propertiesResult = parseErrorProperties(body, fromTopLevel)
  if (!propertiesResult.ok) {
    return propertiesResult
  }

  return {
    ok: true,
    value: {
      type: typeResult.value,
      errorMessage: errorMessageResult.value,
      errorName: errorNameResult.value,
      componentStack: parseOptionalString(body.componentStack),
      platform: parseOptionalString(body.platform),
      timestamp: parseOptionalString(body.timestamp),
      sessionId: parseOptionalString(body.sessionId),
      properties: propertiesResult.properties,
    },
  }
}
