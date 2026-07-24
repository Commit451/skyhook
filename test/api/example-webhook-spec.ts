import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { app } from '../../src/index.ts'

type Delivery = {
    url: string
    method: string | undefined
    body: string | undefined
}

afterEach(() => mock.restoreAll())

describe('example webhook API', () => {
    it('parses and sends the packaged example for every advertised provider', async () => {
        const deliveries: Delivery[] = []
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
            assert.notDeepEqual(JSON.parse(delivery.body), {})
        }
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
