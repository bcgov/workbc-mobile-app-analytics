import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import type { AppEnv } from '../src/config/env.js'
import type { SummaryMetrics } from '../src/db/summaryRepository.js'
import type { Logger } from '../src/lib/logger.js'
import { renderSummaryPage } from '../src/views/summaryPage.js'

const testSummaryUsername = 'summary-user'
const testSummaryPassword = 'summary-pass'

const testEnv: AppEnv = {
  port: 3000,
  nodeEnv: 'test',
  logLevel: 'error',
  apiKey: 'test-api-key',
  databaseUrl: 'postgresql://localhost:5432/test',
  summaryUsername: testSummaryUsername,
  summaryPassword: testSummaryPassword,
}

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const sampleMetrics: SummaryMetrics = {
  uniqueVisitorsToday: 12,
  uniqueVisitorsLast7Days: 84,
  uniqueVisitorsLast30Days: 310,
  authenticatedEvents: 620,
  notAuthenticatedEvents: 380,
  totalErrors: 42,
  topPages: [
    { screenName: 'LandingScreen', views: 1500 },
    { screenName: 'LookupScreen/Lookup', views: 980 },
    { screenName: '<script>alert(1)</script>', views: 10 },
  ],
}

function basicAuthHeader(
  username: string,
  password: string,
): Record<string, string> {
  const encoded = Buffer.from(`${username}:${password}`).toString('base64')
  return { Authorization: `Basic ${encoded}` }
}

function createSummaryApp(metrics: SummaryMetrics = sampleMetrics) {
  return createApp(testEnv, noopLogger, {
    events: { insertEvent: async () => {} },
    errors: { insertError: async () => {} },
    summary: { getSummaryMetrics: async () => metrics },
  })
}

describe('GET /v1/summary', () => {
  it('returns 401 without auth', async () => {
    const app = createSummaryApp()
    const res = await app.request('/v1/summary')

    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe(
      'Basic realm="WorkBC Analytics Summary"',
    )
    await expect(res.text()).resolves.toBe('Unauthorized')
  })

  it('returns 401 with wrong password', async () => {
    const app = createSummaryApp()
    const res = await app.request('/v1/summary', {
      headers: basicAuthHeader(testSummaryUsername, 'wrong-password'),
    })

    expect(res.status).toBe(401)
  })

  it('returns HTML with valid basic auth', async () => {
    const app = createSummaryApp()
    const res = await app.request('/v1/summary', {
      headers: basicAuthHeader(testSummaryUsername, testSummaryPassword),
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')
  })

  it('renders visitor, auth, error, and top page metrics', async () => {
    const app = createSummaryApp()
    const res = await app.request('/v1/summary', {
      headers: basicAuthHeader(testSummaryUsername, testSummaryPassword),
    })
    const html = await res.text()

    expect(html).toContain('12')
    expect(html).toContain('84')
    expect(html).toContain('310')
    expect(html).toContain('62% logged in')
    expect(html).toContain('38% not logged in')
    expect(html).toContain('42')
    expect(html).toContain('Get Started')
    expect(html).toContain('Account Lookup')
    expect(html).toContain('title="LandingScreen"')
    expect(html).toContain('title="LookupScreen/Lookup"')
  })

  it('escapes unsafe screen names in HTML output', async () => {
    const app = createSummaryApp()
    const res = await app.request('/v1/summary', {
      headers: basicAuthHeader(testSummaryUsername, testSummaryPassword),
    })
    const html = await res.text()

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('returns 500 when metrics query fails', async () => {
    const app = createApp(testEnv, noopLogger, {
      events: { insertEvent: async () => {} },
      errors: { insertError: async () => {} },
      summary: {
        getSummaryMetrics: async () => {
          throw new Error('database unavailable')
        },
      },
    })

    const res = await app.request('/v1/summary', {
      headers: basicAuthHeader(testSummaryUsername, testSummaryPassword),
    })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({
      ok: false,
      error: { code: 'INTERNAL_ERROR' },
    })
  })
})

describe('renderSummaryPage', () => {
  it('renders empty top pages state', () => {
    const html = renderSummaryPage({
      uniqueVisitorsToday: 0,
      uniqueVisitorsLast7Days: 0,
      uniqueVisitorsLast30Days: 0,
      authenticatedEvents: 0,
      notAuthenticatedEvents: 0,
      totalErrors: 0,
      topPages: [],
    })
    expect(html).toContain('No page views recorded yet.')
  })
})
