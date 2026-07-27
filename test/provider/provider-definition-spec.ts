import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defineEventProvider, defineProvider } from '../../src/provider/Provider.ts'
import { ProviderRegistry } from '../../src/provider/ProviderRegistry.ts'
import { ProviderRunner } from '../../src/provider/ProviderRunner.ts'
import { SKYHOOK_FOOTER } from '../../src/util/DiscordEmbed.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'

const example = { body: 'dockerhub/dockerhub.json' }

describe('functional provider definitions', () => {
    it('rejects invalid provider metadata at definition time', () => {
        const map = (): void => undefined

        assert.throws(() => defineProvider({ path: 'Bad Path', name: 'Bad', example, map }), /provider path/i)
        assert.throws(() => defineProvider({ path: 'bad', name: '   ', example, map }), /provider name/i)
        assert.throws(
            () => defineProvider({ path: 'bad', name: 'Bad', example: { body: '   ' }, map }),
            /example body/i,
        )
        assert.throws(
            () =>
                defineProvider({
                    path: 'bad',
                    name: 'Bad',
                    example,
                    http: { allowedHosts: ['HTTPS://example.com/path'] },
                    map,
                }),
            /HTTP host/i,
        )
    })

    it('normalizes request input and applies provider defaults centrally', async () => {
        const provider = defineProvider({
            path: 'functional',
            name: 'Functional',
            example,
            defaults: {
                username: 'Functional Bot',
                embedColor: 0x123456,
            },
            async map({ body, headers, query }, output) {
                assert.equal(headers.get('x-event'), 'created')
                assert.equal(query.get('source'), 'test')
                output.payload.content = String(body.value)
                output.payload.allowed_mentions = { parse: ['everyone'] }
                output.addEmbed({ title: 'Created' })
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        const result = await runner.run('functional', {
            body: { value: 'complete' },
            headers: { 'X-Event': 'created' },
            query: { source: 'test' },
        })

        assert.equal(result?.content, 'complete')
        assert.equal(result?.username, 'Functional Bot')
        assert.deepEqual(result?.allowed_mentions, { parse: [] })
        assert.equal(result?.embeds?.[0].color, 0x123456)
        assert.deepEqual(result?.embeds?.[0].footer, SKYHOOK_FOOTER)
    })

    it('uses a fresh output draft for every execution and awaits asynchronous maps', async () => {
        const provider = defineProvider({
            path: 'fresh',
            name: 'Fresh',
            example,
            async map({ body }, output) {
                await new Promise((resolve) => setTimeout(resolve, 5))
                output.addEmbed({ title: String(body.value) })
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        const first = await runner.run('fresh', { body: { value: 'first' } })
        const second = await runner.run('fresh', { body: { value: 'second' } })

        assert.deepEqual(
            first?.embeds?.map(({ title }) => title),
            ['first'],
        )
        assert.deepEqual(
            second?.embeds?.map(({ title }) => title),
            ['second'],
        )
    })

    it('returns null for malformed roots and providers that explicitly ignore an input', async () => {
        let calls = 0
        const provider = defineProvider({
            path: 'ignore',
            name: 'Ignore',
            example,
            map(_request, output) {
                calls += 1
                output.ignore()
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        assert.equal(await runner.run('ignore', { body: null }), null)
        assert.equal(await runner.run('ignore', { body: { ignored: true } }), null)
        assert.equal(calls, 1)
    })

    it('rejects an accidental empty draft instead of sending an unusable payload', async () => {
        const provider = defineProvider({
            path: 'empty',
            name: 'Empty',
            example,
            map(_request, output) {
                output.addEmbed({})
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        await assert.rejects(runner.run('empty', { body: {} }), /produced no Discord message/i)
    })

    it('dispatches event providers through raw event keys without reflection or a separate allowlist', async () => {
        const provider = defineEventProvider({
            path: 'events',
            name: 'Events',
            example,
            event: ({ headers }) => headers.get('x-event'),
            handlers: {
                'build.finished': (_request, output) => {
                    output.payload.content = 'finished'
                },
                build_finished: (_request, output) => {
                    output.payload.content = 'underscored'
                },
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        assert.equal(
            (await runner.run('events', { body: {}, headers: { 'x-event': 'build.finished' } }))?.content,
            'finished',
        )
        assert.equal(
            (await runner.run('events', { body: {}, headers: { 'x-event': 'build_finished' } }))?.content,
            'underscored',
        )
        assert.equal(await runner.run('events', { body: {}, headers: { 'x-event': 'unknown' } }), null)
    })

    it('ignores non-string and oversized event selectors rather than coercing them', async () => {
        const provider = defineEventProvider({
            path: 'strict-events',
            name: 'Strict Events',
            example,
            event: 'event',
            handlers: {
                '[object Object]': (_request, output) => {
                    output.payload.content = 'coerced object'
                },
                valid: (_request, output) => {
                    output.payload.content = 'valid'
                },
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        assert.equal(await runner.run('strict-events', { body: { event: {} } }), null)
        assert.equal(await runner.run('strict-events', { body: { event: 'x'.repeat(257) } }), null)
        assert.equal((await runner.run('strict-events', { body: { event: 'valid' } }))?.content, 'valid')
    })

    it('finalizes oversized drafts into validator-clean Discord payloads', async () => {
        const provider = defineProvider({
            path: 'bounded',
            name: 'Bounded',
            example,
            map(_request, output) {
                output.payload.content = 'x'.repeat(3000)
                for (let embedIndex = 0; embedIndex < 12; embedIndex += 1) {
                    output.addEmbed({
                        title: 't'.repeat(400),
                        description: 'd'.repeat(5000),
                        fields: Array.from({ length: 30 }, (_, fieldIndex) => ({
                            name: `Field ${fieldIndex}`,
                            value: 'v'.repeat(1500),
                        })),
                    })
                }
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        const result = await runner.run('bounded', { body: {} })

        assert.equal(result?.content?.length, 2000)
        assert.ok((result?.embeds?.length ?? 0) <= 10)
        assert.ok((result?.embeds?.[0].fields?.length ?? 0) <= 25)
        assert.deepEqual(validateDiscordPayload(result), [])
    })

    it('drops malformed Discord components while preserving a usable notification', async () => {
        const provider = defineProvider({
            path: 'sanitized',
            name: 'Sanitized',
            example,
            map(_request, output) {
                output.payload.username = 'u'.repeat(100)
                output.payload.avatar_url = 'javascript:alert(1)'
                output.addEmbed({
                    title: 'Safe title',
                    url: 'javascript:alert(1)',
                    timestamp: 'not-a-timestamp',
                    color: -1,
                    author: { name: 'Author', url: 'javascript:alert(1)' },
                    image: { url: 'file:///private/image.png' },
                    thumbnail: { url: 'https://cdn.example.com/image.png' },
                    fields: [null, { name: 'Valid', value: 'Value' }] as never,
                })
            },
        })
        const runner = new ProviderRunner(new ProviderRegistry([provider]))

        const result = await runner.run('sanitized', { body: {} })
        const embed = result?.embeds?.[0]

        assert.equal(result?.username?.length, 80)
        assert.equal(result?.avatar_url, undefined)
        assert.equal(embed?.url, undefined)
        assert.equal(embed?.timestamp, undefined)
        assert.equal(embed?.color, undefined)
        assert.deepEqual(embed?.author, { name: 'Author' })
        assert.equal(embed?.image, undefined)
        assert.deepEqual(embed?.thumbnail, { url: 'https://cdn.example.com/image.png' })
        assert.deepEqual(embed?.fields, [{ name: 'Valid', value: 'Value' }])
        assert.deepEqual(validateDiscordPayload(result), [])
    })
})
