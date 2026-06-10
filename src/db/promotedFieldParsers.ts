const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseUuid(value: unknown): string | null {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    return null
  }
  return value
}

export function parsePlatform(value: unknown): string | null {
  if (value === 'ios' || value === 'android') {
    return value
  }
  return null
}

export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

export function parseIsAuthenticated(value: unknown): boolean | null {
  if (value === true || value === 'true') {
    return true
  }
  if (value === false || value === 'false') {
    return false
  }
  return null
}

export function parseNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function extractProperties(
  properties: Record<string, unknown>,
  promotedKeys: ReadonlySet<string>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => !promotedKeys.has(key)),
  )
}
