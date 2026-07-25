import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BitBucketServer } from '../../src/provider/BitBucketServer.ts'
import { Tester } from '../Tester.ts'

describe('/POST bitbucketserver', () => {
    it('repo:refs_changed', async () => {
        const headers = {
            'x-event-key': 'repo:refs_changed',
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
        const embed = res!.embeds[0]
        assert.equal(embed.title, '[repository] New commit')
        assert.equal(embed.url, 'https://bitbucket.domain.com/projects/PROJ/repos/repository/browse')
        assert.deepEqual(embed.author, {
            name: 'Administrator',
            icon_url: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png',
        })
        assert.equal(Object.hasOwn(embed, 'description'), false)
        assert.deepEqual(
            embed.fields,
            Array.from({ length: 18 }, () => ({
                name: 'Change',
                value: '**Branch:** master \n **Old Hash:** ecddabb624 \n **New Hash:** 178864a7d5 \n **Type:** UPDATE',
            })),
        )
        assert.deepEqual(embed.footer, {
            text: 'Powered by skyhookapi.com',
            icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
        })
        assert.equal(embed.color, 0x205081)
    })

    it('repo:refs_changed 18 fields or less', async () => {
        const headers = {
            'x-event-key': 'repo:refs_changed',
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        assert.notStrictEqual(res, null)
        assert.ok(res!.embeds![0]?.fields?.length <= 18)
    })
})
