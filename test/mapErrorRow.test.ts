import { describe, expect, it } from 'vitest'
import { mapErrorRow } from '../src/db/mapErrorRow.js'
import type { ParsedErrorPayload } from '../src/schemas/errors.js'

const envelope = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  receivedAt: '2026-06-09T12:00:00.100Z',
}

describe('mapErrorRow', () => {
  it('maps error_boundary payload to promoted columns', () => {
    const payload: ParsedErrorPayload = {
      type: 'error_boundary',
      errorMessage: 'Cannot read property of undefined',
      errorName: 'TypeError',
      componentStack: 'in HomeScreen (created by App)',
      platform: 'ios',
      timestamp: '2026-06-09T12:00:00.000Z',
      sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
    }

    const row = mapErrorRow(payload, envelope)

    expect(row.id).toBe(envelope.id)
    expect(row.errorType).toBe('error_boundary')
    expect(row.errorName).toBe('TypeError')
    expect(row.errorMessage).toBe('Cannot read property of undefined')
    expect(row.componentStack).toBe('in HomeScreen (created by App)')
    expect(row.sessionId).toBe('83af1260-a536-4749-a7ed-5da92e6d3510')
    expect(row.platform).toBe('ios')
    expect(row.clientOccurredAt).toEqual(new Date('2026-06-09T12:00:00.000Z'))
    expect(row.properties).toEqual({})
    expect(row.receivedAt).toEqual(new Date(envelope.receivedAt))
  })

  it('stores extra fields in properties', () => {
    const payload: ParsedErrorPayload = {
      type: 'error_boundary',
      errorMessage: 'Something failed',
      errorName: 'Error',
      properties: { customField: 'value' },
    }

    const row = mapErrorRow(payload, envelope)

    expect(row.properties).toEqual({ customField: 'value' })
    expect(row.sessionId).toBeNull()
    expect(row.platform).toBeNull()
    expect(row.clientOccurredAt).toBeNull()
    expect(row.componentStack).toBeNull()
  })

  it('returns null sessionId for invalid UUID', () => {
    const row = mapErrorRow(
      {
        type: 'error_boundary',
        errorMessage: 'fail',
        errorName: 'Error',
        sessionId: 'not-a-uuid',
      },
      envelope,
    )

    expect(row.sessionId).toBeNull()
  })

  it('returns null platform for unsupported value', () => {
    const row = mapErrorRow(
      {
        type: 'error_boundary',
        errorMessage: 'fail',
        errorName: 'Error',
        platform: 'web',
      },
      envelope,
    )

    expect(row.platform).toBeNull()
  })

  it('returns null clientOccurredAt for invalid timestamp', () => {
    const row = mapErrorRow(
      {
        type: 'error_boundary',
        errorMessage: 'fail',
        errorName: 'Error',
        timestamp: 'not-a-date',
      },
      envelope,
    )

    expect(row.clientOccurredAt).toBeNull()
  })

  it('filters promoted keys from properties', () => {
    const row = mapErrorRow(
      {
        type: 'error_boundary',
        errorMessage: 'fail',
        errorName: 'Error',
        platform: 'android',
        properties: {
          platform: 'web',
          sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
          extra: 'data',
        },
      },
      envelope,
    )

    expect(row.platform).toBe('android')
    expect(row.properties).toEqual({ extra: 'data' })
  })
})
