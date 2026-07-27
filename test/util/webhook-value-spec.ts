import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
    canonicalizeIso8601Timestamp,
    firstIso8601Timestamp,
    firstScalar,
    isAllowedHostname,
    isRecord,
    safeId,
    safeIntegerText,
    scalarText,
    trustedHttpsUrl,
} from '../../src/util/WebhookValue.ts'

describe('WebhookValue', () => {
    describe('isRecord', () => {
        it('accepts non-null, non-array objects only', () => {
            assert.equal(isRecord({}), true)
            assert.equal(isRecord(Object.create(null)), true)
            assert.equal(isRecord(new Date(0)), true)
            assert.equal(isRecord(null), false)
            assert.equal(isRecord([]), false)
            assert.equal(isRecord('value'), false)
            assert.equal(isRecord(1), false)
        })
    })

    describe('canonicalizeIso8601Timestamp', () => {
        it('canonicalizes UTC timestamps and truncates fractional seconds to milliseconds', () => {
            assert.equal(canonicalizeIso8601Timestamp('2025-01-10T17:27:48.105316520Z'), '2025-01-10T17:27:48.105Z')
            assert.equal(canonicalizeIso8601Timestamp('2025-01-10T17:27:48.1Z'), '2025-01-10T17:27:48.100Z')
        })

        it('canonicalizes timestamps with numeric offsets to UTC', () => {
            assert.equal(canonicalizeIso8601Timestamp('2021-12-31T19:00:00-05:00'), '2022-01-01T00:00:00.000Z')
            assert.equal(canonicalizeIso8601Timestamp('2025-01-08T10:12:07+02:30'), '2025-01-08T07:42:07.000Z')
        })

        it('rejects non-string and non-canonical timestamp shapes', () => {
            for (const value of [
                null,
                0,
                '2025-01-08',
                '2025-01-08 10:12:07Z',
                '2025-01-08T10:12Z',
                '2025-01-08T10:12:07z',
                '2025-01-08T10:12:07',
                '2025-01-08T10:12:07.1234567890Z',
            ]) {
                assert.equal(canonicalizeIso8601Timestamp(value), null)
            }
        })

        it('rejects impossible dates, times, and numeric offsets', () => {
            for (const value of [
                '2025-02-29T00:00:00Z',
                '2025-02-31T00:00:00Z',
                '2025-13-01T00:00:00Z',
                '2025-01-01T24:00:00Z',
                '2025-01-01T00:60:00Z',
                '2025-01-01T00:00:60Z',
                '2025-01-01T00:00:00+24:00',
                '2025-01-01T00:00:00+00:60',
            ]) {
                assert.equal(canonicalizeIso8601Timestamp(value), null)
            }
        })
    })

    describe('safe scalar extraction', () => {
        it('accepts useful scalar values while rejecting ambiguous numeric values', () => {
            assert.equal(scalarText('  value\n'), 'value')
            assert.equal(scalarText(true), 'true')
            assert.equal(scalarText(42.5), '42.5')
            assert.equal(scalarText(Number.POSITIVE_INFINITY), null)
            assert.equal(scalarText(Number.MAX_SAFE_INTEGER + 1), null)
            assert.equal(scalarText({ value: 'no coercion' }), null)
            assert.equal(firstScalar(null, {}, 'chosen'), 'chosen')
        })

        it('extracts bounded IDs and safe integers', () => {
            assert.equal(safeId('  abc-123  ', 16), 'abc-123')
            assert.equal(safeId('too-long', 4), null)
            assert.equal(safeId(42), '42')
            assert.equal(safeId(1.5), null)
            assert.equal(safeIntegerText(0), '0')
            assert.equal(safeIntegerText(0, true), null)
            assert.equal(safeIntegerText(42, true), '42')
        })

        it('returns the first valid ISO timestamp', () => {
            assert.equal(firstIso8601Timestamp('invalid', '2025-01-10T17:27:48Z'), '2025-01-10T17:27:48.000Z')
        })
    })

    describe('trusted URL policy', () => {
        it('requires HTTPS and an explicitly allowed hostname', () => {
            const policy = { allowedHosts: ['example.com'], maxLength: 100 }
            assert.equal(trustedHttpsUrl('https://example.com/path', policy), 'https://example.com/path')
            assert.equal(trustedHttpsUrl('http://example.com/path', policy), null)
            assert.equal(trustedHttpsUrl('https://evil.example/path', policy), null)
            assert.equal(trustedHttpsUrl('https://example.com.evil/path', policy), null)
        })

        it('allows true subdomains only when requested', () => {
            assert.equal(isAllowedHostname('api.example.com', ['example.com']), false)
            assert.equal(isAllowedHostname('api.example.com', ['example.com'], true), true)
            assert.equal(isAllowedHostname('notexample.com', ['example.com'], true), false)
            assert.equal(
                trustedHttpsUrl('https://api.example.com/path', {
                    allowedHosts: ['example.com'],
                    allowSubdomains: true,
                }),
                'https://api.example.com/path',
            )
        })
    })
})
