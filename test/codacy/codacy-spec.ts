import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Codacy } from '../../src/provider/Codacy.ts'
import { Tester } from '../Tester.ts'

describe('/POST codacy', () => {
    it('commit', async () => {
        const res = await Tester.test(new Codacy(), 'codacy.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
