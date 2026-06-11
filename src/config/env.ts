import { z } from 'zod'
import 'dotenv/config'

const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error'])

export type AppEnv = {
  port: number
  nodeEnv: string
  logLevel: z.infer<typeof logLevelSchema>
  apiKey: string
  databaseUrl: string
  summaryUsername: string
  summaryPassword: string
}

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw === '') {
    return 4000
  }
  const n = Number(raw)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(
      `PORT must be an integer from 1 to 65535, received: ${JSON.stringify(raw)}`,
    )
  }
  return n
}

const envSchema = z.object({
  API_KEY: z.string().min(1, 'API_KEY is required'),
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: logLevelSchema.default('info'),
  SUMMARY_USERNAME: z.string().min(1, 'SUMMARY_USERNAME is required'),
  SUMMARY_PASSWORD: z.string().min(1, 'SUMMARY_PASSWORD is required'),
})

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        msg: 'env_validation_failed',
        issues,
      }),
    )
    process.exit(1)
  }

  try {
    return {
      port: parsePort(process.env.PORT),
      nodeEnv: parsed.data.NODE_ENV,
      logLevel: parsed.data.LOG_LEVEL,
      apiKey: parsed.data.API_KEY,
      databaseUrl: parsed.data.DATABASE_URL,
      summaryUsername: parsed.data.SUMMARY_USERNAME,
      summaryPassword: parsed.data.SUMMARY_PASSWORD,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        msg: 'env_validation_failed',
        issues: message,
      }),
    )
    process.exit(1)
  }
}
