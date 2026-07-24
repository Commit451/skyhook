import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { app } from '../../src/index.ts'

describe('Zendesk provider registration', () => {
    it('advertises the Zendesk webhook endpoint', async () => {
        const response = await app.request('/api/providers')
        assert.equal(response.status, 200)

        const providers = (await response.json()) as { name: string; path: string }[]
        assert.deepEqual(
            providers.find((provider) => provider.path === 'zendesk'),
            { name: 'Zendesk', path: 'zendesk' },
        )
    })
})
