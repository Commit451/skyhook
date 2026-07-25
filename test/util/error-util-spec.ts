import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ErrorUtil } from '../../src/util/ErrorUtil.ts'

describe('ErrorUtil', () => {
    it('creates a Discord-facing parse error without exception, stack, or request details', () => {
        const error = new Error('database exception exposed super-secret-token')
        error.stack = [
            'Error: database exception exposed super-secret-token',
            '    at Shopify.parse (/srv/skyhook/src/provider/Shopify.ts:42:10)',
            'Request payload: {"access_token":"request-secret"}',
        ].join('\n')

        const payload = ErrorUtil.createErrorPayload('shopify', error)
        const serialized = JSON.stringify(payload)

        assert.equal(payload.embeds?.[0]?.title, 'Skyhook Error')
        assert.equal(payload.embeds?.[0]?.url, 'https://github.com/Commit451/skyhook/issues')
        assert.match(payload.embeds?.[0]?.description ?? '', /shopify/)
        assert.doesNotMatch(serialized, /database exception/i)
        assert.doesNotMatch(serialized, /super-secret-token/)
        assert.doesNotMatch(serialized, /Shopify\.parse/)
        assert.doesNotMatch(serialized, /request-secret/)
        assert.doesNotMatch(serialized, /src\/provider/)
    })
})
