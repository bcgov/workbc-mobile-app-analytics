import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

describe('loadEnv', () => {
  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('fails validation when SUMMARY_USERNAME is missing', async () => {
    process.env = {
      API_KEY: 'test-api-key',
      DATABASE_URL: 'postgresql://localhost:5432/test',
      SUMMARY_PASSWORD: 'secret',
      SUMMARY_USERNAME: '',
      NODE_ENV: 'test',
    }

    vi.resetModules()

    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit')
    }) as typeof process.exit)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { loadEnv } = await import('../src/config/env.js')
    expect(() => loadEnv()).toThrow('process.exit')
    expect(error).toHaveBeenCalled()

    exit.mockRestore()
    error.mockRestore()
  })
})
