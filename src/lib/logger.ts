import type { AppEnv } from '../config/env.js'

export type LogLevel = AppEnv['logLevel']

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export type Logger = {
  debug(fields: Record<string, unknown>): void
  info(fields: Record<string, unknown>): void
  warn(fields: Record<string, unknown>): void
  error(fields: Record<string, unknown>): void
}

export function createLogger(env: AppEnv): Logger {
  const minRank = LEVEL_RANK[env.logLevel]

  function emit(level: LogLevel, fields: Record<string, unknown>): void {
    if (LEVEL_RANK[level] < minRank) {
      return
    }
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      ...fields,
    })
    if (level === 'error') {
      console.error(line)
    } else {
      console.log(line)
    }
  }

  return {
    debug: (fields) => emit('debug', fields),
    info: (fields) => emit('info', fields),
    warn: (fields) => emit('warn', fields),
    error: (fields) => emit('error', fields),
  }
}
