import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import type { AppEnv } from '../src/config/env.js'
import type { Logger } from '../src/lib/logger.js'

const testEnv: AppEnv = {
  port: 3000,
  nodeEnv: 'test',
  logLevel: 'error',
}

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

describe('createApp', () => {
  const app = createApp(testEnv, noopLogger)

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

  it('POST /v1/events accepts a valid body with 202', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName: 'screen_view' }),
    })
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true })
    expect(typeof body.id).toBe('string')
    expect(typeof body.receivedAt).toBe('string')
  })

  it('POST /v1/events returns 400 for body missing eventName', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  it('POST /v1/errors/pinning accepts JSON body', async () => {
    const res = await app.request('/v1/errors/pinning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host: 'api.example.com', reason: 'pin mismatch' }),
    })
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
  })

  it('POST /v1/events returns 400 for invalid JSON', async () => {
    const res = await app.request('/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
