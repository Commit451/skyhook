import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Trello } from '../../src/provider/Trello.ts'
import { Tester } from '../Tester.ts'

describe('/POST trello', () => {
    it('commentCard', async () => {
        const res = await Tester.test(new Trello(), 'trello.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
