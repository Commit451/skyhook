import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cleanText, escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../../src/util/DiscordText.ts'

describe('DiscordText', () => {
    describe('cleanText', () => {
        it('normalizes newlines and removes unsupported control characters', () => {
            assert.equal(cleanText(' \u0000alpha\r\nbeta\r\tgamma\u007f ', false), 'alpha\nbeta\n\tgamma')
        })

        it('collapses whitespace for single-line text', () => {
            assert.equal(cleanText(' \tAlpha\r\n beta  \n gamma ', true), 'Alpha beta gamma')
        })
    })

    describe('truncateText', () => {
        it('cleans text before adding a length-bounded ellipsis', () => {
            assert.equal(truncateText('  abc\r\ndef  ', 6, false), 'abc\nd…')
            assert.equal(truncateText('  short  ', 10, true), 'short')
        })

        it('handles zero- and one-character limits', () => {
            assert.equal(truncateText('long', 1, true), '…')
            assert.equal(truncateText('long', 0, true), '')
        })
    })

    describe('escapeDiscordMarkdownLiteral', () => {
        it('escapes every Discord Markdown metacharacter', () => {
            for (const character of [
                '\\',
                '`',
                '*',
                '_',
                '{',
                '}',
                '[',
                ']',
                '(',
                ')',
                '<',
                '>',
                '#',
                '+',
                '!',
                '|',
                '~',
            ]) {
                assert.equal(escapeDiscordMarkdownLiteral(character), `\\${character}`)
            }
        })

        it('leaves ordinary text and mention text unchanged', () => {
            assert.equal(escapeDiscordMarkdownLiteral('@everyone plain-text'), '@everyone plain-text')
        })
    })

    describe('humanizeWords', () => {
        it('turns separated words into a sentence-cased label', () => {
            assert.equal(humanizeWords('  CUSTOMER.account-status  '), 'Customer account status')
            assert.equal(humanizeWords('already spaced'), 'Already spaced')
        })
    })
})
