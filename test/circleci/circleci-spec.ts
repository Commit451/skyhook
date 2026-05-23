import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CircleCi } from '../../src/provider/CircleCi.ts'
import { Tester } from '../Tester.ts'

describe('/POST circleci', () => {
    it('build', async () => {
        const res = await Tester.test(new CircleCi(), 'circleci.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
