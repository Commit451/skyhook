import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { VSTS } from '../../src/provider/VSTS.ts'
import { Tester } from '../Tester.ts'

describe('/POST vsts', () => {
    it('git.push', async () => {
        const res = await Tester.test(new VSTS(), 'vsts.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
