import { describe, expect, it } from 'vitest'
import { mapEventRow } from '../src/db/mapEventRow.js'
import type { ParsedEventPayload } from '../src/schemas/events.js'

const envelope = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  receivedAt: '2026-06-04T21:51:26.100Z',
}

describe('mapEventRow', () => {
  it('maps screen_view payload to promoted columns and event-specific properties', () => {
    const payload: ParsedEventPayload = {
      eventName: 'screen_view',
      properties: {
        screenName: 'Main/DrawerHome/BottomTabsHome/HomeScreen',
        previousScreenName: 'Main/DrawerHome/Job/Landing',
        platform: 'ios',
        timestamp: '2026-06-04T21:51:26.054Z',
        sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
        isAuthenticated: 'true',
      },
    }

    const row = mapEventRow(payload, envelope)

    expect(row.id).toBe(envelope.id)
    expect(row.eventName).toBe('screen_view')
    expect(row.sessionId).toBe('83af1260-a536-4749-a7ed-5da92e6d3510')
    expect(row.platform).toBe('ios')
    expect(row.clientOccurredAt).toEqual(new Date('2026-06-04T21:51:26.054Z'))
    expect(row.isAuthenticated).toBe(true)
    expect(row.screenName).toBe('Main/DrawerHome/BottomTabsHome/HomeScreen')
    expect(row.properties).toEqual({
      previousScreenName: 'Main/DrawerHome/Job/Landing',
    })
    expect(row.receivedAt).toEqual(new Date(envelope.receivedAt))
  })

  it('maps button_click payload with event-specific properties only', () => {
    const payload: ParsedEventPayload = {
      eventName: 'button_click',
      properties: {
        screenName: 'JobDetailsScreen',
        buttonId: 'apply_now',
        elementType: 'button',
        platform: 'android',
        timestamp: '2026-06-04T21:51:30.000Z',
        sessionId: '83af1260-a536-4749-a7ed-5da92e6d3510',
      },
    }

    const row = mapEventRow(payload, envelope)

    expect(row.eventName).toBe('button_click')
    expect(row.screenName).toBe('JobDetailsScreen')
    expect(row.properties).toEqual({
      buttonId: 'apply_now',
      elementType: 'button',
    })
  })

  it('uses empty properties and null promoted columns when properties omitted', () => {
    const payload: ParsedEventPayload = { eventName: 'screen_view' }

    const row = mapEventRow(payload, envelope)

    expect(row.properties).toEqual({})
    expect(row.sessionId).toBeNull()
    expect(row.platform).toBeNull()
    expect(row.clientOccurredAt).toBeNull()
    expect(row.isAuthenticated).toBeNull()
    expect(row.screenName).toBeNull()
  })

  it('parses isAuthenticated string true to boolean', () => {
    const row = mapEventRow(
      {
        eventName: 'screen_view',
        properties: { isAuthenticated: 'true' },
      },
      envelope,
    )

    expect(row.isAuthenticated).toBe(true)
    expect(row.properties).toEqual({})
  })

  it('returns null sessionId for invalid UUID', () => {
    const row = mapEventRow(
      {
        eventName: 'screen_view',
        properties: { sessionId: 'not-a-uuid' },
      },
      envelope,
    )

    expect(row.sessionId).toBeNull()
  })

  it('returns null platform for unsupported value', () => {
    const row = mapEventRow(
      {
        eventName: 'screen_view',
        properties: { platform: 'web' },
      },
      envelope,
    )

    expect(row.platform).toBeNull()
  })

  it('returns null clientOccurredAt for invalid timestamp', () => {
    const row = mapEventRow(
      {
        eventName: 'screen_view',
        properties: { timestamp: 'not-a-date' },
      },
      envelope,
    )

    expect(row.clientOccurredAt).toBeNull()
  })
})
