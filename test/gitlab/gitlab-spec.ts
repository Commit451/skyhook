import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GitLab } from '../../src/provider/GitLab.ts'
import { Tester } from '../Tester.ts'

describe('/POST gitlab', () => {
    it('push', async () => {
        const res = await Tester.test(GitLab, 'gitlab.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
        assert.deepEqual(res!.embeds[0], {
            title: '[Diaspora:master] 4 commits',
            url: 'http://example.com/mike/diaspora/tree/master',
            fields: [
                {
                    name: 'Commit from Jordi Mallach',
                    value: '([`b6568db`](http://example.com/mike/diaspora/commit/b6568db1bc1dcd7f8b4d5a946b0b91f9dacd7327)) Update Catalan translation to e38cb41.',
                    inline: false,
                },
                {
                    name: 'Commit from GitLab dev user',
                    value: '([`da15608`](http://example.com/mike/diaspora/commit/da1560886d4f094c3e6c9ef40349f7d38b5d27d7)) fixed readme',
                    inline: false,
                },
            ],
            author: {
                name: 'John Smith',
                icon_url:
                    'https://s.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=8://s.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=80',
            },
            footer: {
                text: 'Powered by skyhookapi.com',
                icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
            },
            color: 0xfca326,
        })
    })
})
