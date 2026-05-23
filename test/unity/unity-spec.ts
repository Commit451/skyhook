import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Unity } from '../../src/provider/Unity.ts'
import { Tester } from '../Tester.ts'

describe('/POST unity', () => {
    it('build', async () => {
        const res = await Tester.test(new Unity(), 'unity.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
