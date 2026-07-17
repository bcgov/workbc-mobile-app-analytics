import { describe, expect, it } from 'vitest'
import { formatScreenName } from '../src/lib/screenLabels.js'

describe('formatScreenName', () => {
  it('maps known full paths and leaf names', () => {
    expect(formatScreenName('LandingScreen')).toBe('Get Started')
    expect(formatScreenName('LookupScreen/Lookup')).toBe('Account Lookup')
    expect(formatScreenName('ConsentScreen')).toBe('Consent')
    expect(formatScreenName('Main/DrawerHome/BottomTabsHome/HomeScreen')).toBe(
      'Home',
    )
    expect(formatScreenName('HomeScreen')).toBe('Home')
    expect(formatScreenName('JobDetailsScreen')).toBe('Job Details')
  })

  it('resolves nested paths via leaf segment when full path is unmapped', () => {
    expect(formatScreenName('SomeWrapper/Lookup')).toBe('Account Lookup')
    expect(formatScreenName('Main/DrawerHome/Job/JobDetails')).toBe(
      'Job Details',
    )
  })

  it('humanizes unknown route names', () => {
    expect(formatScreenName('CustomReportScreen')).toBe('Custom Report')
    expect(formatScreenName('Foo/BarBazStack')).toBe('Bar Baz')
  })

  it('preserves empty and whitespace-only input', () => {
    expect(formatScreenName('')).toBe('')
    expect(formatScreenName('   ')).toBe('   ')
  })
})
