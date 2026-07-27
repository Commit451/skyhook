import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { Square } from '../../src/provider/Square.ts'
import { Tester } from '../Tester.ts'

const envelope = {
    merchant_id: 'merchant_123',
    event_id: 'f8f2adf4-28ea-4c06-9df0-c76f6f5c612d',
    created_at: '2026-07-26T14:30:15.123Z',
}

describe('/POST square', () => {
    it('exposes provider metadata', () => {
        const provider = Square

        assert.equal(provider.name, 'Square')
        assert.equal(provider.path, 'square')
    })

    it('formats the documented customer payload used by example delivery', async () => {
        const example = loadProviderExample('square')
        const result = await Tester.testWithBody(Square, example.body, example.headers, example.query)
        assert.notEqual(result, null)
        assert.equal(result!.username, 'Square')
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds?.length, 1)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Customer created: MyFirst Customer')
        assert.equal(embed.timestamp, '2021-05-17T22:46:29.000Z')
        assert.equal(embed.color, 0x006aff)
        assert.deepEqual(embed.fields, [{ name: 'Customer ID', value: '\\{CUSTOMER\\_ID\\}', inline: true }])
        assert.doesNotMatch(JSON.stringify(result), /customer@mysite\.com/)
    })

    it('summarizes payment events with status, money, and identifiers', async () => {
        const result = await Tester.testWithBody(Square, {
            ...envelope,
            location_id: 'location_123',
            type: 'payment.updated',
            data: {
                type: 'payment',
                id: 'payment_123',
                object: {
                    payment: {
                        id: 'payment_123',
                        status: 'COMPLETED',
                        amount_money: { amount: 1234, currency: 'USD' },
                        order_id: 'order_123',
                    },
                },
            },
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Payment updated')
        assert.equal(embed.timestamp, '2026-07-26T14:30:15.123Z')
        assert.deepEqual(embed.fields, [
            { name: 'Status', value: 'Completed', inline: true },
            { name: 'Amount', value: '12.34 USD', inline: true },
            { name: 'Order ID', value: 'order\\_123', inline: true },
            { name: 'Location ID', value: 'location\\_123', inline: true },
            { name: 'Payment ID', value: 'payment\\_123', inline: true },
        ])
    })

    it('accepts the documented mixed-case Location data type', async () => {
        const result = await Tester.testWithBody(Square, {
            ...envelope,
            location_id: 'location_123',
            type: 'location.created',
            data: {
                type: 'Location',
                id: 'location_123',
                object: {
                    location: {
                        id: 'location_123',
                        name: 'Main **Store**',
                        status: 'ACTIVE',
                    },
                },
            },
        })
        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'Location created: Main \\*\\*Store\\*\\*')
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Status', value: 'Active', inline: true },
            { name: 'Location ID', value: 'location\\_123', inline: true },
        ])
    })

    it('handles deleted objects and future event families generically', async () => {
        const deleted = await Tester.testWithBody(Square, {
            ...envelope,
            type: 'customer.deleted',
            data: {
                type: 'customer',
                id: 'customer_456',
                deleted: true,
            },
        })
        assert.notEqual(deleted, null)
        assert.equal(deleted!.embeds![0].title, 'Customer deleted')
        assert.deepEqual(deleted!.embeds![0].fields, [{ name: 'Customer ID', value: 'customer\\_456', inline: true }])

        const future = await Tester.testWithBody(Square, {
            ...envelope,
            type: 'inventory.adjustment.flagged',
            data: {
                type: 'inventory_adjustment',
                id: 'adjustment_789',
                object: {
                    inventory_adjustment: {
                        name: 'Cycle **count**',
                        status: '[blocked](https://evil.example)',
                    },
                },
            },
        })
        assert.notEqual(future, null)
        assert.equal(future!.embeds![0].title, 'Inventory adjustment flagged: Cycle \\*\\*count\\*\\*')
        assert.deepEqual(future!.embeds![0].fields, [
            {
                name: 'Status',
                value: '\\[blocked\\]\\(https://evil.example\\)',
                inline: true,
            },
            { name: 'Inventory adjustment ID', value: 'adjustment\\_789', inline: true },
        ])
    })

    it('accepts documented event data that has no affected object ID', async () => {
        const catalog = await Tester.testWithBody(Square, {
            ...envelope,
            type: 'catalog.version.updated',
            data: {
                type: 'catalog_version',
                object: {
                    catalog_version: {
                        updated_at: '2026-07-26T14:29:00Z',
                    },
                },
            },
        })
        assert.notEqual(catalog, null)
        assert.equal(catalog!.embeds![0].title, 'Catalog version updated')
        assert.deepEqual(catalog!.embeds![0].fields, [])

        const revoked = await Tester.testWithBody(Square, {
            ...envelope,
            type: 'oauth.authorization.revoked',
            data: {
                type: 'revocation',
                object: {
                    revocation: {
                        revoked_at: '2026-07-26T14:29:00Z',
                    },
                },
            },
        })
        assert.notEqual(revoked, null)
        assert.equal(revoked!.embeds![0].title, 'OAuth authorization revoked')
        assert.deepEqual(revoked!.embeds![0].fields, [])
    })

    it('rejects malformed webhook envelopes', async () => {
        const valid = {
            ...envelope,
            type: 'customer.created',
            data: { type: 'customer', id: 'customer_123', object: { customer: {} } },
        }
        for (const body of [
            null,
            {},
            { ...valid, merchant_id: '' },
            { ...valid, event_id: '' },
            { ...valid, created_at: '2026-02-31T00:00:00Z' },
            { ...valid, type: 'invalid' },
            { ...valid, type: 'Customer.created' },
            { ...valid, data: null },
            { ...valid, data: { type: '', id: 'customer_123' } },
            { ...valid, data: { type: 'customer', id: '' } },
            { ...valid, data: { type: 'customer', id: null } },
        ]) {
            assert.equal(await Tester.testWithBody(Square, body), null)
        }
    })

    it('stays within Discord limits for long untrusted object values', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const result = await Tester.testWithBody(Square, {
            ...envelope,
            type: 'catalog.version.updated',
            data: {
                type: 'catalog_version',
                id: 'catalog_version_123',
                object: {
                    catalog_version: {
                        name: longText,
                        status: longText,
                        reference_id: longText,
                    },
                },
            },
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })

        const embed = result!.embeds![0]
        assert.ok((embed.title?.length ?? 0) <= 256)
        assert.ok((embed.description?.length ?? 0) <= 4096)
        assert.ok((embed.fields?.length ?? 0) <= 25)
        for (const field of embed.fields ?? []) {
            assert.ok(field.name.length <= 256)
            assert.ok(field.value.length <= 1024)
        }
        const aggregateLength =
            (embed.title?.length ?? 0) +
            (embed.description?.length ?? 0) +
            (embed.author?.name.length ?? 0) +
            (embed.footer?.text.length ?? 0) +
            (embed.fields ?? []).reduce((total, field) => total + field.name.length + field.value.length, 0)
        assert.ok(aggregateLength <= 6000)
    })
})
