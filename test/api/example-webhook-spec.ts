import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { app } from '../../src/index.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'
import { logger } from '../../src/util/logger.ts'

type Delivery = {
    url: string
    method: string | undefined
    body: string | undefined
}

afterEach(() => mock.restoreAll())

describe('example webhook API', () => {
    it('parses and sends the packaged example for every advertised provider', async () => {
        const deliveries: Delivery[] = []
        const validationWarnings: string[] = []
        mock.method(logger, 'warn', (message: unknown) => {
            const text = String(message)
            if (text.includes('discord_payload_validation_warning')) validationWarnings.push(text)
        })
        mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
            deliveries.push({
                url: String(input),
                method: init?.method,
                body: typeof init?.body === 'string' ? init.body : undefined,
            })
            return new Response(null, { status: 204 })
        })

        const providersResponse = await app.request('/api/providers')
        assert.equal(providersResponse.status, 200)
        const providers = (await providersResponse.json()) as { path: string }[]

        for (const [index, provider] of providers.entries()) {
            const response = await app.request(`/api/webhooks/example-${index}/secret/${provider.path}/example`, {
                method: 'POST',
            })
            assert.equal(response.status, 200, provider.path)
        }

        assert.equal(deliveries.length, providers.length)
        for (const [index, delivery] of deliveries.entries()) {
            assert.equal(delivery.url, `https://discordapp.com/api/webhooks/example-${index}/secret`)
            assert.equal(delivery.method, 'POST')
            assert.ok(delivery.body)
            const payload = JSON.parse(delivery.body)
            assert.notDeepEqual(payload, {})
            assert.deepEqual(validateDiscordPayload(payload), [], providers[index].path)
        }
        assert.deepEqual(validationWarnings, [])
    })

    it('keeps the existing test route as a compatibility alias', async () => {
        const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))

        const response = await app.request('/api/webhooks/example/secret/gitlab/test', { method: 'POST' })

        assert.equal(response.status, 200)
        assert.equal(fetchMock.mock.callCount(), 1)
    })

    it('rejects an unknown provider without attempting a Discord delivery', async () => {
        const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))

        const response = await app.request('/api/webhooks/example/secret/not-a-provider/example', { method: 'POST' })

        assert.equal(response.status, 400)
        assert.match(await response.text(), /Unknown provider/)
        assert.equal(fetchMock.mock.callCount(), 0)
    })

    it('delivers a sanitized live parse error while logging full diagnostics server-side', async () => {
        const deliveries: string[] = []
        const diagnostics: unknown[] = []
        mock.method(globalThis, 'fetch', async (_input: string | URL | Request, init?: RequestInit) => {
            if (typeof init?.body === 'string') deliveries.push(init.body)
            return new Response(null, { status: 204 })
        })
        mock.method(logger, 'error', (message: unknown) => diagnostics.push(message))

        const response = await app.request('/api/webhooks/parse-error/secret/gitlab', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{"private-request-fragment":',
        })

        assert.equal(response.status, 500)
        assert.equal(deliveries.length, 1)
        const deliveredPayload = JSON.parse(deliveries[0])
        const deliveredText = JSON.stringify(deliveredPayload)
        assert.equal(deliveredPayload.embeds?.[0]?.title, 'Skyhook Error')
        assert.match(deliveredPayload.embeds?.[0]?.description ?? '', /gitlab/)
        assert.doesNotMatch(deliveredText, /private-request-fragment/)
        assert.doesNotMatch(deliveredText, /SyntaxError|Unexpected|JSON\.parse|src\/index/i)

        const loggedText = diagnostics.map(String).join('\n')
        assert.match(loggedText, /Error during parse:/)
        assert.match(loggedText, /SyntaxError|JSON|Unexpected/i)
    })

    it('bounds Discord delivery time and keeps upstream failure details out of the response', async () => {
        const diagnostics: unknown[] = []
        let deliverySignal: AbortSignal | null | undefined
        mock.method(globalThis, 'fetch', async (_input: string | URL | Request, init?: RequestInit) => {
            deliverySignal = init?.signal
            return new Response('private Discord diagnostic', { status: 400 })
        })
        mock.method(logger, 'error', (message: unknown) => diagnostics.push(message))

        const response = await app.request('/api/webhooks/delivery-failure/secret/gitlab/example', {
            method: 'POST',
        })

        assert.equal(response.status, 500)
        const responseText = await response.text()
        assert.equal(responseText, 'Unable to deliver webhook.')
        assert.ok(deliverySignal instanceof AbortSignal)
        assert.doesNotMatch(responseText, /private Discord diagnostic|Discord webhook responded/i)
        assert.match(
            diagnostics.map(String).join('\n'),
            /Discord webhook responded with 400: private Discord diagnostic/,
        )
    })

    it('shares the webhook delivery rate limit with example pushes', async () => {
        const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))
        const url = '/api/webhooks/rate-limited/secret/gitlab/example'

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await app.request(url, { method: 'POST' })
            assert.equal(response.status, 200)
        }

        const limitedResponse = await app.request(url, { method: 'POST' })
        assert.equal(limitedResponse.status, 429)
        assert.equal(limitedResponse.headers.get('retry-after'), '1')
        assert.equal(fetchMock.mock.callCount(), 5)
    })
})
