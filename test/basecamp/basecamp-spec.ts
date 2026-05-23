import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Basecamp } from '../../src/provider/Basecamp.ts'
import { Tester } from '../Tester.ts'

describe('/POST basecamp', () => {
    it('general', async () => {
        const res = await Tester.test(new Basecamp(), 'basecamp.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds) && res!.embeds.length > 0)
    })
})
