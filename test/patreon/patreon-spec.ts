import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Patreon } from '../../src/provider/Patreon.ts'
import { Tester } from '../Tester.ts'

describe('/POST patreon', () => {
    it('pledges:create (deprecated)', async () => {
        const headers = {
            'x-patreon-event': 'pledges:create',
        }
        const res = await Tester.test(new Patreon(), 'patreon-pledge-create.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('members:update', async () => {
        const headers = {
            'x-patreon-event': 'members:create',
        }
        const res = await Tester.test(new Patreon(), 'patreon-member-create.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
