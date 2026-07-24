import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { app } from '../../src/index.ts'

describe('Linear provider registration', () => {
    it('advertises and accepts the Linear webhook endpoint', async () => {
        const providersResponse = await app.request('/api/providers')
        assert.equal(providersResponse.status, 200)

        const providers = (await providersResponse.json()) as { name: string; path: string }[]
        assert.deepEqual(
            providers.find((provider) => provider.path === 'linear'),
            { name: 'Linear', path: 'linear' },
        )

        const readyResponse = await app.request('/api/webhooks/example-id/example-secret/linear')
        assert.equal(readyResponse.status, 200)
    })
})
