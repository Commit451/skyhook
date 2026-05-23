import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BitBucketServer } from '../../src/provider/BitBucketServer.ts'
import { Tester } from '../Tester.ts'

describe('/POST bitbucketserver', () => {
    it('repo:refs_changed', async () => {
        const headers = {
            'x-event-key': 'repo:refs_changed',
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('repo:refs_changed 18 fields or less', async () => {
        const headers = {
            'x-event-key': 'repo:refs_changed',
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(res!.embeds![0]?.fields?.length <= 18)
    })
})
