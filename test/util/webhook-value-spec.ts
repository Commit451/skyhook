import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canonicalizeIso8601Timestamp, isRecord } from '../../src/util/WebhookValue.ts'

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
})
