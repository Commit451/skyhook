import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Rollbar } from '../../src/provider/Rollbar.ts'
import { Tester } from '../Tester.ts'

describe('/POST rollbar', () => {
    it('new item', async () => {
        const res = await Tester.test(new Rollbar(), 'rollbar.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
