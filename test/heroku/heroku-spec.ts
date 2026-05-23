import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Heroku } from '../../src/provider/Heroku.ts'
import { Tester } from '../Tester.ts'

describe('/POST heroku', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Heroku(), 'heroku.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
