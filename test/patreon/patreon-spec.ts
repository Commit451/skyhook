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
        assert.equal(res!.embeds[0].title, 'Pledged $1.50')
        assert.equal(res!.embeds[0].url, 'https://www.patreon.com/thecampaign')
        assert.deepEqual(res!.embeds[0].author, {
            name: 'Patreon User',
            icon_url:
                'https://c10.patreonusercontent.com/3/eyJ3IjoyMDB9/patreon-media/p/user/7070707/796849be3e5f406ca6391995d5985694/1.png?token-time=2145916800&token-hash=F9l2cZHAFSer14-CuPwaY0gEnbZ4m-dRlROCKMwZe5g%3D',
            url: 'https://www.patreon.com/patreonuser',
        })
        assert.deepEqual(res!.embeds[0].fields, [
            {
                name: 'Unlocked Tier',
                value: '[Patron on Discord ($1.00+/mo)](https://www.patreon.com/join/thecampaign/checkout?rid=5050505)\n﻿    • Earn the **Patron** rank on our [Discord Server](https://discord.gg/abcdefg).\n',
                inline: false,
            },
        ])
    })

    it('members:create preserves the current v2 output', async () => {
        const deprecatedPayload = await Tester.test(new Patreon(), 'patreon-pledge-create.json', {
            'x-patreon-event': 'pledges:create',
        })
        const headers = {
            'x-patreon-event': 'members:create',
        }
        const res = await Tester.test(new Patreon(), 'patreon-member-create.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
        assert.deepEqual(res, deprecatedPayload)
    })
})
