import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { app } from '../../src/index.ts'

afterEach(() => mock.restoreAll())

describe('example webhook abuse rate limit', () => {
    it('limits example deliveries even when callers rotate webhook credentials', async () => {
        const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))

        for (let attempt = 0; attempt < 60; attempt += 1) {
            const response = await app.request(
                `/api/webhooks/rotating-${attempt}/rotating-secret-${attempt}/gitlab/example`,
                { method: 'POST' },
            )
            assert.equal(response.status, 200)
        }

        const limitedResponse = await app.request('/api/webhooks/rotating-60/rotating-secret-60/gitlab/example', {
            method: 'POST',
        })
        assert.equal(limitedResponse.status, 429)
        assert.equal(limitedResponse.headers.get('retry-after'), '60')
        assert.equal(fetchMock.mock.callCount(), 60)
    })
})
