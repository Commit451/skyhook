import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Embed, EmbedField } from '../../src/model/DiscordApi.ts'
import {
    DISCORD_EMBED_LIMITS,
    DISCORD_MESSAGE_LIMITS,
    fitLiteralEmbedFields,
    SKYHOOK_FOOTER,
    SKYHOOK_FOOTER_TEXT,
} from '../../src/util/DiscordEmbed.ts'

describe('DiscordEmbed', () => {
    it('exposes the Discord limits and footer text used by bounded provider embeds', () => {
        assert.deepEqual(DISCORD_MESSAGE_LIMITS, {
            content: 2000,
            embeds: 10,
            embedCharacters: 6000,
        })
        assert.deepEqual(DISCORD_EMBED_LIMITS, {
            title: 256,
            description: 4096,
            fieldName: 256,
            fieldValue: 1024,
            authorName: 256,
            footerText: 2048,
            fields: 25,
        })
        assert.equal(SKYHOOK_FOOTER_TEXT, 'Powered by skyhookapi.com')
        assert.deepEqual(SKYHOOK_FOOTER, {
            text: 'Powered by skyhookapi.com',
            icon_url: 'https://www.skyhookapi.com/images/skyhook-tiny.png',
        })
    })

    describe('fitLiteralEmbedFields', () => {
        it('escapes literal field text, preserves inline policy, and skips empty fields', () => {
            const candidates: EmbedField[] = [
                { name: '\u0000', value: 'ignored', inline: false },
                { name: '**Name**', value: '[value](https://example.com)', inline: true },
                { name: 'Empty value', value: '\u0000', inline: false },
            ]

            assert.deepEqual(fitLiteralEmbedFields({}, candidates), [
                {
                    name: '\\*\\*Name\\*\\*',
                    value: '\\[value\\]\\(https://example.com\\)',
                    inline: true,
                },
            ])
        })

        it('enforces field count and individual field limits after escaping', () => {
            const candidates: EmbedField[] = [
                { name: '*'.repeat(300), value: '('.repeat(2000), inline: false },
                ...Array.from({ length: 29 }, (_, index) => ({ name: `Field ${index}`, value: 'Value' })),
            ]

            const fields = fitLiteralEmbedFields({}, candidates)

            assert.equal(fields.length, DISCORD_EMBED_LIMITS.fields)
            assert.equal(fields[0].name.length, DISCORD_EMBED_LIMITS.fieldName)
            assert.equal(fields[0].value.length, DISCORD_EMBED_LIMITS.fieldValue)
            assert.ok(fields[0].name.endsWith('…'))
            assert.ok(fields[0].value.endsWith('…'))
        })

        it('accounts for the existing embed text and default footer in the total character budget', () => {
            const name = 'Field'
            const embed: Embed = {
                title: 't'.repeat(
                    DISCORD_MESSAGE_LIMITS.embedCharacters - SKYHOOK_FOOTER_TEXT.length - name.length - 5,
                ),
            }

            assert.deepEqual(fitLiteralEmbedFields(embed, [{ name, value: 'x'.repeat(20) }]), [
                { name, value: 'xxxx…', inline: undefined },
            ])
        })

        it('accepts an explicit footer text for the total character budget', () => {
            const footerText = 'Custom footer'
            const name = 'Field'
            const embed: Embed = {
                description: 'd'.repeat(DISCORD_MESSAGE_LIMITS.embedCharacters - footerText.length - name.length - 3),
            }

            assert.deepEqual(fitLiteralEmbedFields(embed, [{ name, value: 'abcdef' }], { footerText }), [
                { name, value: 'ab…', inline: undefined },
            ])
        })
    })
})
