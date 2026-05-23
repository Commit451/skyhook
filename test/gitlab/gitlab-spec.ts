import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GitLab } from '../../src/provider/GitLab.ts'
import { Tester } from '../Tester.ts'

describe('/POST gitlab', () => {
    it('push', async () => {
        const res = await Tester.test(new GitLab(), 'gitlab.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
