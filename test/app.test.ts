import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import type { AppEnv } from '../src/config/env.js'
import type { ErrorInsertRow } from '../src/db/mapErrorRow.js'
import type { EventInsertRow } from '../src/db/mapEventRow.js'
import type { Logger } from '../src/lib/logger.js'

const testApiKey = 'test-api-key'

const testEnv: AppEnv = {
  port: 3000,
  nodeEnv: 'test',
  logLevel: 'error',
  apiKey: testApiKey,
  databaseUrl: 'postgresql://localhost:5432/test',
  summaryUsername: 'summary-user',
  summaryPassword: 'summary-pass',
}

function apiKeyHeaders(): Record<string, string> {
  return { 'X-API-Key': testApiKey }
}

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const noopDeps = {
  events: { insertEvent: async () => {} },
  errors: { insertError: async () => {} },
  summary: {
    getSummaryMetrics: async () => ({
      uniqueVisitorsToday: 0,
      uniqueVisitorsLast7Days: 0,
      uniqueVisitorsLast30Days: 0,
      authenticatedEvents: 0,
      notAuthenticatedEvents: 0,
      totalErrors: 0,
      topPages: [],
    }),
  },
}

describe('createApp', () => {
  const app = createApp(testEnv, noopLogger, noopDeps)

  it('GET /health returns 200 and expected JSON', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ status: 'ok' })
  })

  it('GET /ready returns 200', async () => {
    const res = await app.request('/ready')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ status: 'ready' })
  })

  it('POST /v1/events returns 401 without API key', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName: 'screen_view' }),
    })
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Valid API key is required',
      },
    })
  })

  it('POST /v1/events accepts a valid body with 202', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({ eventName: 'screen_view' }),
    })
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true })
    expect(typeof body.id).toBe('string')
    expect(typeof body.receivedAt).toBe('string')
  })

  it('POST /v1/events stores flat top-level fields via insertEvent', async () => {
    let inserted: EventInsertRow | undefined
    const capturingApp = createApp(testEnv, noopLogger, {
      events: {
        insertEvent: async (row) => {
          inserted = row
        },
      },
      errors: { insertError: async () => {} },
      summary: noopDeps.summary,
    })

    const res = await capturingApp.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        eventName: 'screen_view',
        screenName: 'HomeScreen',
        previousScreenName: 'Landing',
        platform: 'ios',
        timestamp: '2026-06-04T21:51:26.054Z',
        sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
        isAuthenticated: 'true',
      }),
    })

    expect(res.status).toBe(202)
    expect(inserted).toBeDefined()
    expect(inserted!.screenName).toBe('HomeScreen')
    expect(inserted!.platform).toBe('ios')
    expect(inserted!.sessionId).toBe('83af1260-a536-4749-a7ed-5da92e6d3510')
    expect(inserted!.isAuthenticated).toBe(true)
    expect(inserted!.properties).toEqual({
      previousScreenName: 'Landing',
    })
  })

  it('POST /v1/events stores event-specific properties via insertEvent', async () => {
    let inserted: EventInsertRow | undefined
    const capturingApp = createApp(testEnv, noopLogger, {
      events: {
        insertEvent: async (row) => {
          inserted = row
        },
      },
      errors: { insertError: async () => {} },
      summary: noopDeps.summary,
    })

    const res = await capturingApp.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        eventName: 'button_click',
        properties: {
          screenName: 'JobDetailsScreen',
          buttonId: 'apply_now',
          platform: 'ios',
          timestamp: '2026-06-04T21:51:30.000Z',
          sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
        },
      }),
    })

    expect(res.status).toBe(202)
    expect(inserted).toBeDefined()
    expect(inserted!.eventName).toBe('button_click')
    expect(inserted!.screenName).toBe('JobDetailsScreen')
    expect(inserted!.platform).toBe('ios')
    expect(inserted!.sessionId).toBe('83af1260-a536-4749-a7ed-5da92e6d3510')
    expect(inserted!.properties).toEqual({ buttonId: 'apply_now' })
  })

  it('POST /v1/events returns 500 when insert fails', async () => {
    const failingApp = createApp(testEnv, noopLogger, {
      events: {
        insertEvent: async () => {
          throw new Error('database unavailable')
        },
      },
      errors: { insertError: async () => {} },
      summary: noopDeps.summary,
    })

    const res = await failingApp.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({ eventName: 'screen_view' }),
    })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({
      ok: false,
      error: { code: 'INTERNAL_ERROR' },
    })
  })

  it('POST /v1/events returns 400 for body missing eventName', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'eventName is required',
        fields: { eventName: 'required' },
      },
    })
  })

  it('POST /v1/errors returns 401 without API key', async () => {
    const res = await app.request('/v1/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'error_boundary',
        errorMessage: 'Cannot read property',
        errorName: 'TypeError',
      }),
    })
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Valid API key is required',
      },
    })
  })

  it('POST /v1/errors accepts a valid body with 202', async () => {
    const res = await app.request('/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        type: 'error_boundary',
        errorMessage: 'Cannot read property',
        errorName: 'TypeError',
      }),
    })
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true })
    expect(typeof body.id).toBe('string')
    expect(typeof body.receivedAt).toBe('string')
  })

  it('POST /v1/errors stores promoted columns via insertError', async () => {
    let inserted: ErrorInsertRow | undefined
    const capturingApp = createApp(testEnv, noopLogger, {
      events: { insertEvent: async () => {} },
      errors: {
        insertError: async (row) => {
          inserted = row
        },
      },
      summary: noopDeps.summary,
    })

    const res = await capturingApp.request('/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        type: 'error_boundary',
        errorMessage: 'Cannot read property of undefined',
        errorName: 'TypeError',
        componentStack: 'in HomeScreen (created by App)',
        platform: 'ios',
        timestamp: '2026-06-09T12:00:00.000Z',
        sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
      }),
    })

    expect(res.status).toBe(202)
    expect(inserted).toBeDefined()
    expect(inserted!.errorType).toBe('error_boundary')
    expect(inserted!.errorName).toBe('TypeError')
    expect(inserted!.errorMessage).toBe('Cannot read property of undefined')
    expect(inserted!.componentStack).toBe('in HomeScreen (created by App)')
    expect(inserted!.platform).toBe('ios')
    expect(inserted!.sessionId).toBe('83af1260-a536-4749-a7ed-5da92e6d3510')
    expect(inserted!.properties).toEqual({})
  })

  it('POST /v1/errors returns 500 when insert fails', async () => {
    const failingApp = createApp(testEnv, noopLogger, {
      events: { insertEvent: async () => {} },
      errors: {
        insertError: async () => {
          throw new Error('database unavailable')
        },
      },
      summary: noopDeps.summary,
    })

    const res = await failingApp.request('/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        type: 'error_boundary',
        errorMessage: 'fail',
        errorName: 'Error',
      }),
    })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({
      ok: false,
      error: { code: 'INTERNAL_ERROR' },
    })
  })

  it('POST /v1/errors returns 400 for body missing type', async () => {
    const res = await app.request('/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: JSON.stringify({
        errorMessage: 'fail',
        errorName: 'Error',
      }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'type is required',
        fields: { type: 'required' },
      },
    })
  })

  it('POST /v1/errors returns 400 for invalid JSON', async () => {
    const res = await app.request('/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: 'not-json',
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Body must be valid JSON',
      },
    })
  })

  it('POST /v1/events returns 400 for invalid JSON', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiKeyHeaders(),
      },
      body: 'not-json',
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Body must be valid JSON',
      },
    })
  })
})
