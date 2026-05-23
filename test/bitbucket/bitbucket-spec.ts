import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BitBucket } from '../../src/provider/Bitbucket.ts'
import { Tester } from '../Tester.ts'

describe('/POST bitbucket', () => {
    it('repo:push', async () => {
        const headers = {
            'x-event-key': 'repo:push',
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('repo:push tag', async () => {
        const headers = {
            'x-event-key': 'repo:push',
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket-tag.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('repo:push anonymous-user', async () => {
        const headers = {
            'x-event-key': 'repo:push',
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket-anonymous.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
