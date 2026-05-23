import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Jenkins } from '../../src/provider/Jenkins.ts'
import { Tester } from '../Tester.ts'

describe('/POST jenkins', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Jenkins(), 'jenkins.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
