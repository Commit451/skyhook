import type { Context, MiddlewareHandler } from 'hono'
import { logger } from '../util/logger.ts'

/**
 * A simple in-memory sliding-window rate limiter for webhook requests.
 *
 * Rate limiting is keyed on the webhook URL (webhookID + webhookSecret from the
 * URL path), so each Discord webhook gets its own quota. This prevents a single
 * webhook from being spammed through skyhook while not affecting providers that
 * share IP ranges.
 *
 * This is suitable for single-instance deployments. For multi-instance
 * deployments, use a shared store like Redis.
 */
export interface RateLimitOptions {
    windowMs: number
    max: number
    message?: string
}

interface WindowData {
    count: number
    resetTime: number
}

const defaultOptions: RateLimitOptions = {
    windowMs: 60_000, // 1 minute
    max: 60, // 60 requests per minute per webhook URL
    message: 'Rate limit exceeded. Please try again later.',
}

const store = new Map<string, WindowData>()

export function rateLimiter(options?: Partial<RateLimitOptions>): MiddlewareHandler {
    const opts: RateLimitOptions = { ...defaultOptions, ...(options ?? {}) }

    // Periodically clean up expired entries
    setInterval(() => {
        const now = Date.now()
        for (const [key, data] of store) {
            if (data.resetTime < now) {
                store.delete(key)
            }
        }
    }, opts.windowMs * 2).unref()

    return async (c: Context, next: () => Promise<void>): Promise<Response | undefined> => {
        // Rate limit based on the webhook URL (webhookID + webhookSecret)
        const webhookID = c.req.param('webhookID')
        const webhookSecret = c.req.param('webhookSecret')
        const key = `${webhookID}:${webhookSecret}`

        const now = Date.now()
        const existing = store.get(key)

        if (existing && existing.resetTime > now) {
            if (existing.count >= opts.max) {
                logger.warn(`Rate limit exceeded for webhook: ${webhookID}`)
                return c.text(opts.message ?? 'Rate limit exceeded.', 429, {
                    'Retry-After': String(Math.ceil((existing.resetTime - now) / 1000)),
                    'X-RateLimit-Limit': String(opts.max),
                    'X-RateLimit-Remaining': '0',
                })
            }
            existing.count++
        } else {
            store.set(key, { count: 1, resetTime: now + opts.windowMs })
        }

        const remaining = Math.max(0, opts.max - (existing?.count ?? 1))
        c.header('X-RateLimit-Limit', String(opts.max))
        c.header('X-RateLimit-Remaining', String(remaining))

        await next()
    }
}
