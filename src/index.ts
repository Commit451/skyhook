import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { type Context, Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { rateLimiter } from 'hono-rate-limiter'
import type { DiscordPayload } from './model/DiscordApi.ts'
import { providerRegistry } from './provider/ProviderRegistry.ts'
import { ProviderRunner } from './provider/ProviderRunner.ts'
import { ErrorUtil } from './util/ErrorUtil.ts'
import { logger } from './util/logger.ts'

logger.debug('Logger set up successfully.')

export const app = new Hono()

const providerRunner = new ProviderRunner(providerRegistry)
const DISCORD_WEBHOOK_TIMEOUT_MS = 10_000
for (const { name } of providerRegistry.providerInfos) {
    logger.debug(`Adding provider: ${name}`)
}

app.use('*', cors())
app.use(
    '*',
    bodyLimit({
        maxSize: 2 * 1024 * 1024, // 2MB
        onError: (c) => c.text('Request body too large. Maximum size is 2MB.', 413),
    }),
)
app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) => c.redirect('https://www.skyhookapi.com/'))

app.get('/api/providers', (c) => c.json(providerRegistry.providerInfos, 200))

const info = {
    version: process.env.K_REVISION,
    deployment: process.env.K_SERVICE,
}
app.get('/api/info', (c) => c.json(info, 200))

const webhookRateLimiter = rateLimiter({
    windowMs: 1000, // 1 second
    limit: 5, // 5 requests per second per webhook URL
    keyGenerator: (c) => {
        const webhookID = c.req.param('webhookID')
        const webhookSecret = c.req.param('webhookSecret')
        return `${webhookID}:${webhookSecret}`
    },
    message: 'Rate limit exceeded. Maximum 5 requests per second per webhook.',
    statusCode: 429,
    handler: (c, _next, _options) => {
        logger.warn(`Rate limit exceeded for webhook: ${c.req.param('webhookID')}`)
        return c.text('Rate limit exceeded. Maximum 5 requests per second per webhook.', 429, {
            'Retry-After': '1',
        })
    },
})

const exampleAbuseRateLimiter = rateLimiter({
    windowMs: 60_000,
    limit: 60,
    keyGenerator: () => 'example-deliveries',
    standardHeaders: false,
    message: 'Example message rate limit exceeded. Maximum 60 requests per minute.',
    statusCode: 429,
    handler: (c, _next, _options) => {
        logger.warn('Global example message rate limit exceeded.')
        return c.text('Example message rate limit exceeded. Maximum 60 requests per minute.', 429, {
            'Retry-After': '60',
        })
    },
})

app.get('/api/webhooks/:webhookID/:webhookSecret/:from', (c) => {
    // Return 200 if the provider is valid to show this url is ready.
    const provider = c.req.param('from')
    if (provider == null || !providerRegistry.has(provider)) {
        const errorMessage = `Unknown provider ${provider}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }
    return c.body(null, 200)
})

app.post('/api/webhooks/:webhookID/:webhookSecret/:from', webhookRateLimiter, async (c) => {
    const webhookID = c.req.param('webhookID')
    const webhookSecret = c.req.param('webhookSecret')
    const providerPath = c.req.param('from')
    if (!webhookID || !webhookSecret || !providerPath) {
        return c.body(null, 400)
    }
    const discordEndpoint = `https://discordapp.com/api/webhooks/${webhookID}/${webhookSecret}`

    let discordPayload: DiscordPayload | null = null

    if (!providerRegistry.has(providerPath)) {
        const errorMessage = `Unknown provider ${providerPath}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }

    try {
        const queryObject = c.req.query()
        const headersObject: Record<string, string> = {}
        c.req.raw.headers.forEach((value, key) => {
            headersObject[key] = value
        })
        const body = await parseRequestBody(c)
        discordPayload = await providerRunner.run(providerPath, {
            body,
            headers: headersObject,
            query: queryObject,
        })
    } catch (error) {
        const diagnostics = error instanceof Error ? (error.stack ?? error.message) : String(error)
        logger.error(`Error during parse: ${diagnostics}`)
        discordPayload = ErrorUtil.createErrorPayload(providerPath, error)
        return sendPayload(providerPath, discordPayload, discordEndpoint, c, 500)
    }

    return sendPayload(providerPath, discordPayload, discordEndpoint, c)
})

const sendExampleWebhook = async (c: Context): Promise<Response> => {
    const webhookID = c.req.param('webhookID')
    const webhookSecret = c.req.param('webhookSecret')
    const providerPath = c.req.param('from')
    if (!webhookID || !webhookSecret || !providerPath) {
        return c.body(null, 400)
    }
    const discordEndpoint = `https://discordapp.com/api/webhooks/${webhookID}/${webhookSecret}`
    if (!providerRegistry.has(providerPath)) {
        const errorMessage = `Unknown provider ${providerPath}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }

    try {
        const discordPayload = await providerRunner.runExample(providerPath)
        return sendPayload(providerPath, discordPayload, discordEndpoint, c)
    } catch (error) {
        logger.error(`Unable to create example payload for /${providerPath}: ${error}`)
        return c.text('Unable to create example message.', 500)
    }
}

app.post(
    '/api/webhooks/:webhookID/:webhookSecret/:from/example',
    exampleAbuseRateLimiter,
    webhookRateLimiter,
    sendExampleWebhook,
)
// Preserve the original endpoint for clients that already use it.
app.post(
    '/api/webhooks/:webhookID/:webhookSecret/:from/test',
    exampleAbuseRateLimiter,
    webhookRateLimiter,
    sendExampleWebhook,
)

app.notFound((c) => {
    const acceptsHtml = c.req.header('accept')?.toLowerCase().includes('text/html') ?? false
    const isBrowserNavigation = (c.req.method === 'GET' || c.req.method === 'HEAD') && acceptsHtml
    const requestUrl = new URL(c.req.url)
    const isPotentialWebhookUrl = requestUrl.pathname.startsWith('/api/webhooks')

    if (isBrowserNavigation && !isPotentialWebhookUrl) {
        // The apex domain serves the API while the website lives on www. Send browser
        // navigations to the same path there so GitHub Pages can render its custom 404.
        // Do not forward query strings or malformed webhook paths, which may contain secrets.
        const websiteUrl = new URL('https://www.skyhookapi.com/')
        websiteUrl.pathname = requestUrl.pathname
        return c.redirect(websiteUrl.href)
    }

    return c.text('Not Found', 404)
})

const isMainModule = process.argv[1] != null && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
const server = isMainModule ? startServer() : null

function startServer(): ReturnType<typeof serve> {
    const port = normalizePort(process.env.PORT || '8080')
    return serve(
        {
            fetch: app.fetch,
            port: typeof port === 'number' ? port : 8080,
        },
        (addressInfo) => {
            logger.debug(
                `Your app is listening on port ${addressInfo.port}. Test out with http://localhost:${addressInfo.port}/api/providers`,
            )
        },
    )
}

function normalizePort(givenPort: string): string | number | boolean {
    const normalizedPort = parseInt(givenPort, 10)

    if (Number.isNaN(normalizedPort)) {
        // named pipe
        return givenPort
    }

    if (normalizedPort >= 0) {
        // port number
        return normalizedPort
    }

    return false
}

/**
 * Parses the request body based on its Content-Type. Falls back to JSON if the
 * Content-Type is missing or unrecognized so providers that omit headers still work.
 */
async function parseRequestBody(c: Context): Promise<any> {
    const contentType = (c.req.header('content-type') || '').toLowerCase()
    if (contentType.includes('application/json')) {
        return c.req.json()
    }
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        return c.req.parseBody()
    }
    try {
        return await c.req.json()
    } catch {
        return {}
    }
}

/**
 * Sends the correctly formatted payload to the Discord channel
 */
async function sendPayload(
    providerPath: string,
    discordPayload: DiscordPayload | null,
    discordEndpoint: string,
    c: Context,
    upstreamStatusOverride?: ContentfulStatusCode,
): Promise<Response> {
    if (discordPayload == null) {
        logger.error('Discord payload is null')
        return c.text(`Webhook event is either not supported or not implemented by /${providerPath}.`, 200)
    }
    if (Object.keys(discordPayload).length === 0) {
        logger.error('Bad implementation, outbound payload is empty.')
        return c.text('Bad implementation.', 500)
    }
    const jsonString = JSON.stringify(discordPayload)
    try {
        const response = await fetch(discordEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
            signal: AbortSignal.timeout(DISCORD_WEBHOOK_TIMEOUT_MS),
        })
        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`Discord webhook responded with ${response.status}: ${errorBody}`)
        }
        return c.body(null, upstreamStatusOverride ?? 200)
    } catch (err) {
        const diagnostics = err instanceof Error ? (err.stack ?? err.message) : String(err)
        logger.error(diagnostics)
        return c.text('Unable to deliver webhook.', 500)
    }
}

export default server
