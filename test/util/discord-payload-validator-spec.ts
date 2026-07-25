import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'

const issueCodes = (payload: unknown): string[] => validateDiscordPayload(payload).map((issue) => issue.code)

describe('validateDiscordPayload', () => {
    it('accepts a payload on every Discord boundary without mutating it', () => {
        const payload = {
            content: 'c'.repeat(2000),
            embeds: [
                {
                    title: 't'.repeat(256),
                    description: 'd'.repeat(4096),
                    author: { name: 'a'.repeat(256) },
                    footer: { text: 'f'.repeat(2048) },
                    fields: [{ name: 'n'.repeat(256), value: 'v'.repeat(1024) }],
                },
            ],
        }
        const before = structuredClone(payload)

        const issues = validateDiscordPayload(payload)

        assert.deepEqual(
            issues.map((issue) => issue.code),
            ['embed-total-characters'],
        )
        assert.deepEqual(payload, before)
    })

    it('reports invalid payload, content, and embeds shapes', () => {
        assert.deepEqual(issueCodes(null), ['payload-type'])
        assert.deepEqual(issueCodes({ content: 42 }), ['content-type'])
        assert.deepEqual(issueCodes({ embeds: {} }), ['embeds-type'])
    })

    it('reports null content when the optional property is present', () => {
        assert.deepEqual(validateDiscordPayload({ content: null }), [{ code: 'content-type', path: 'content' }])
    })

    it('reports null embeds when the optional property is present', () => {
        assert.deepEqual(validateDiscordPayload({ embeds: null }), [{ code: 'embeds-type', path: 'embeds' }])
    })

    it('reports null optional embed text with precise paths', () => {
        const issues = validateDiscordPayload({ embeds: [{ title: null, description: null }] })

        assert.deepEqual(
            issues.map(({ code, path }) => ({ code, path })),
            [
                { code: 'embed-title-type', path: 'embeds[0].title' },
                { code: 'embed-description-type', path: 'embeds[0].description' },
            ],
        )
    })

    it('requires author names and footer text when their containers are present', () => {
        const issues = validateDiscordPayload({ embeds: [{ author: {}, footer: {} }] })

        assert.deepEqual(
            issues.map(({ code, path }) => ({ code, path })),
            [
                { code: 'embed-author-name-type', path: 'embeds[0].author.name' },
                { code: 'embed-footer-text-type', path: 'embeds[0].footer.text' },
            ],
        )
    })

    it('reports null optional embed containers with precise paths', () => {
        const issues = validateDiscordPayload({ embeds: [{ author: null, footer: null, fields: null }] })

        assert.deepEqual(
            issues.map(({ code, path }) => ({ code, path })),
            [
                { code: 'embed-author-type', path: 'embeds[0].author' },
                { code: 'embed-footer-type', path: 'embeds[0].footer' },
                { code: 'embed-fields-type', path: 'embeds[0].fields' },
            ],
        )
    })

    it('requires string names and values for every embed field', () => {
        const issues = validateDiscordPayload({ embeds: [{ fields: [{}, { name: null, value: null }] }] })

        assert.deepEqual(
            issues.map(({ code, path }) => ({ code, path })),
            [
                { code: 'embed-field-name-type', path: 'embeds[0].fields[0].name' },
                { code: 'embed-field-value-type', path: 'embeds[0].fields[0].value' },
                { code: 'embed-field-name-type', path: 'embeds[0].fields[1].name' },
                { code: 'embed-field-value-type', path: 'embeds[0].fields[1].value' },
            ],
        )
    })

    it('reports content and embed-count limits', () => {
        assert.ok(issueCodes({ content: 'x'.repeat(2001) }).includes('content-length'))
        assert.ok(issueCodes({ embeds: Array.from({ length: 11 }, () => ({})) }).includes('embed-count'))
    })

    it('reports every individual embed limit', () => {
        const fields = Array.from({ length: 26 }, (_, index) => ({
            name: index === 0 ? 'n'.repeat(257) : 'name',
            value: index === 0 ? 'v'.repeat(1025) : 'value',
        }))
        const codes = issueCodes({
            embeds: [
                {
                    title: 't'.repeat(257),
                    description: 'd'.repeat(4097),
                    author: { name: 'a'.repeat(257) },
                    footer: { text: 'f'.repeat(2049) },
                    fields,
                },
            ],
        })

        for (const code of [
            'embed-title-length',
            'embed-description-length',
            'embed-author-name-length',
            'embed-footer-text-length',
            'embed-field-count',
            'embed-field-name-length',
            'embed-field-value-length',
            'embed-total-characters',
        ]) {
            assert.ok(codes.includes(code), code)
        }
    })

    it('reports the 6000-character total across all embeds in the message', () => {
        const codes = issueCodes({
            embeds: [{ description: 'a'.repeat(3000) }, { description: 'b'.repeat(3001) }],
        })

        assert.deepEqual(codes, ['embed-total-characters'])
    })

    it('counts author names toward the message-wide embed character total', () => {
        const codes = issueCodes({
            embeds: [{ description: 'd'.repeat(4096), footer: { text: 'f'.repeat(1904) }, author: { name: 'a' } }],
        })

        assert.deepEqual(codes, ['embed-total-characters'])
    })

    it('reports non-string embed text and field values with precise paths', () => {
        const issues = validateDiscordPayload({
            embeds: [
                {
                    title: 1,
                    author: { name: false },
                    footer: { text: 2 },
                    fields: [{ name: 'Count', value: 3 }],
                },
            ],
        })

        assert.deepEqual(
            issues.map(({ code, path }) => ({ code, path })),
            [
                { code: 'embed-title-type', path: 'embeds[0].title' },
                { code: 'embed-author-name-type', path: 'embeds[0].author.name' },
                { code: 'embed-footer-text-type', path: 'embeds[0].footer.text' },
                { code: 'embed-field-value-type', path: 'embeds[0].fields[0].value' },
            ],
        )
    })
})
