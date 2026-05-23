import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Pingdom } from '../../src/provider/Pingdom.ts'
import { Tester } from '../Tester.ts'

describe('/POST pingdom', () => {
    it('check', async () => {
        const res = await Tester.test(new Pingdom(), 'pingdom.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
