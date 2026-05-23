import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NewRelic } from '../../src/provider/NewRelic.ts'
import { Tester } from '../Tester.ts'

describe('/POST newrelic', () => {
    it('deploy', async () => {
        const res = await Tester.test(new NewRelic(), 'newrelic.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
