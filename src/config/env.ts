import { z } from 'zod'
import 'dotenv/config'

const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error'])

export type AppEnv = {
  port: number
  nodeEnv: string
  logLevel: z.infer<typeof logLevelSchema>
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

const optionalEnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: logLevelSchema.default('info'),
})

export function loadEnv(): AppEnv {
  const parsed = optionalEnvSchema.safeParse(process.env)
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
