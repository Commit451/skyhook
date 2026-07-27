import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { Trello } from '../../src/provider/Trello.ts'
import { Tester } from '../Tester.ts'

afterEach(() => mock.restoreAll())

describe('/POST trello', () => {
    it('commentCard', async () => {
        const res = await Tester.test(Trello, 'trello.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
        assert.deepEqual(res!.embeds[0], {
            author: {
                name: 'Daniel Scalzi',
                icon_url: 'https://trello-avatars.s3.amazonaws.com/1a36134efab762cad3aadd250440b715/170.png',
                url: 'https://trello.com/danielscalzi',
            },
            color: 0xb04632,
            title: '[Example Board] Commented on Card "Example Card"',
            url: 'https://trello.com/c/Hz7qP25x/20-example-card#comment-5946eae0be7d3669fc554adf',
            description: '**Example Comment**\n\nThis is an example comment.',
            footer: {
                text: 'Powered by skyhookapi.com',
                icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
            },
        })
    })

    for (const [eventType, action, mark] of [
        ['enable_plugin', 'Enabled', '✓'],
        ['disable_plugin', 'Disabled', '✗'],
    ] as const) {
        it(`${eventType} preserves output and bounds manifest loading`, async () => {
            let manifestSignal: AbortSignal | null | undefined
            mock.method(globalThis, 'fetch', async (_input: string | URL | Request, init?: RequestInit) => {
                manifestSignal = init?.signal
                return new Response(
                    JSON.stringify({
                        name: 'Calendar',
                        details: 'Plugin details',
                        icon: { url: '/calendar.png' },
                    }),
                    { status: 200, headers: { 'content-type': 'application/json' } },
                )
            })

            const res = await Tester.testWithBody(Trello, {
                action: {
                    type: eventType,
                    memberCreator: {
                        fullName: 'Ada Lovelace',
                        avatarHash: 'avatar',
                        username: 'ada',
                    },
                    data: {
                        board: { name: 'Example Board', shortLink: 'board' },
                        plugin: {
                            name: 'Calendar fallback',
                            url: 'https://trello.com/manifest.json',
                        },
                    },
                },
                model: { prefs: { background: 'blue' } },
            })

            assert.ok(manifestSignal instanceof AbortSignal)
            assert.deepEqual(res?.embeds?.[0], {
                author: {
                    name: 'Ada Lovelace',
                    icon_url: 'https://trello-avatars.s3.amazonaws.com/avatar/170.png',
                    url: 'https://trello.com/ada',
                },
                color: 0x0079bf,
                url: 'https://trello.com/b/board/example-board',
                title: `[Example Board] ${action} Plugin ${mark}`,
                fields: [{ name: 'Calendar', value: 'Plugin details', inline: false }],
                image: { url: 'https://trello.com/calendar.png' },
                footer: {
                    text: 'Powered by skyhookapi.com',
                    icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
                },
            })
        })
    }
})
