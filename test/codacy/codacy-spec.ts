import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Codacy } from '../../src/provider/Codacy.ts'
import { Tester } from '../Tester.ts'

describe('/POST codacy', () => {
    it('formats a commit exactly', async () => {
        const res = await Tester.test(Codacy, 'codacy.json', null)

        assert.deepStrictEqual(res, {
            allowed_mentions: { parse: [] },
            embeds: [
                {
                    title: 'New Commit',
                    url: 'https://www.codacy.com/public/jquery/jquery.git/commit?bid=21776&cid=6037089',
                    fields: [
                        { name: 'Fixed Issues', value: '1', inline: true },
                        { name: 'New Issues', value: '0', inline: true },
                    ],
                    footer: {
                        text: 'Powered by skyhookapi.com',
                        icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
                    },
                    color: 0x242c33,
                },
            ],
        })
    })

    it('emits string field names and values', async () => {
        const res = await Tester.test(Codacy, 'codacy.json', null)
        assert.notStrictEqual(res, null)

        for (const embed of res!.embeds ?? []) {
            for (const field of embed.fields ?? []) {
                assert.strictEqual(typeof field.name, 'string')
                assert.strictEqual(typeof field.value, 'string')
            }
        }
    })
})
