import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Travis } from '../../src/provider/Travis.ts'
import { Tester } from '../Tester.ts'

describe('/POST travis', () => {
    it('build', async () => {
        const res = await Tester.test(new Travis(), 'travis.json', {})
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
