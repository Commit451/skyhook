import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { app } from '../../src/index.ts'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { Stripe } from '../../src/provider/Stripe.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'
import { Tester } from '../Tester.ts'

const snapshotEvent = {
    id: 'evt_123',
    object: 'event',
    api_version: '2026-06-24.dahlia',
    created: 1785175200,
    livemode: false,
    pending_webhooks: 1,
    request: { id: 'req_123', idempotency_key: null },
}

describe('/POST stripe', () => {
    it('advertises and accepts the Stripe webhook endpoint', async () => {
        const providersResponse = await app.request('/api/providers')
        assert.equal(providersResponse.status, 200)
        const providers = (await providersResponse.json()) as { name: string; path: string }[]

        assert.deepEqual(
            providers.find((provider) => provider.path === 'stripe'),
            { name: 'Stripe', path: 'stripe' },
        )
        assert.equal((await app.request('/api/webhooks/example-id/example-secret/stripe')).status, 200)
    })

    it('exposes provider metadata and formats the packaged Stripe snapshot example', async () => {
        assert.equal(Stripe.name, 'Stripe')
        assert.equal(Stripe.path, 'stripe')

        const example = loadProviderExample('stripe')
        const result = await Tester.testWithBody(Stripe, example.body, example.headers, example.query)

        assert.notEqual(result, null)
        assert.equal(result!.username, 'Stripe')
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds?.length, 1)
        assert.equal(result!.embeds![0].title, 'Setup intent created')
        assert.equal(result!.embeds![0].timestamp, '2023-06-06T22:19:30.000Z')
        assert.equal(result!.embeds![0].color, 0x635bff)
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Mode', value: 'Test', inline: true },
            { name: 'Status', value: 'Requires confirmation', inline: true },
            {
                name: 'Setup intent ID',
                value: 'seti\\_1NG8Du2eZvKYlo2C9XMqbR0x',
                inline: true,
            },
            { name: 'Event ID', value: 'evt\\_1NG8Du2eZvKYlo2CUI79vXWy', inline: true },
        ])
        assert.doesNotMatch(JSON.stringify(result), /client_secret|O2CdhLwGFh2Aej7bCY7qp8jlIuyR8DJ/)
        assert.deepEqual(validateDiscordPayload(result!), [])
    })

    it('summarizes successful payments with amount, customer, description, and IDs', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_123',
                    object: 'payment_intent',
                    amount: 2599,
                    amount_received: 2599,
                    currency: 'usd',
                    customer: 'cus_123',
                    description: 'Order **#42** from @everyone',
                    status: 'succeeded',
                },
            },
        })

        assert.notEqual(result, null)
        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Payment intent succeeded')
        assert.equal(embed.description, 'Order \\*\\*\\#42\\*\\* from @everyone')
        assert.equal(embed.timestamp, '2026-07-27T18:00:00.000Z')
        assert.deepEqual(embed.fields, [
            { name: 'Mode', value: 'Test', inline: true },
            { name: 'Status', value: 'Succeeded', inline: true },
            { name: 'Amount received', value: '25.99 USD', inline: true },
            { name: 'Customer ID', value: 'cus\\_123', inline: true },
            { name: 'Payment intent ID', value: 'pi\\_123', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
    })

    it('summarizes failed invoice payments and changed attributes without dumping private data', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            id: 'evt_invoice_failed',
            livemode: true,
            type: 'invoice.payment_failed',
            account: 'acct_123',
            data: {
                previous_attributes: {
                    status: 'draft',
                    hosted_invoice_url: 'https://example.invalid/private',
                },
                object: {
                    id: 'in_123',
                    object: 'invoice',
                    amount_due: 4500,
                    amount_paid: 0,
                    amount_remaining: 4500,
                    currency: 'eur',
                    customer: 'cus_456',
                    subscription: 'sub_456',
                    status: 'open',
                    customer_email: 'private@example.com',
                },
            },
        })

        assert.notEqual(result, null)
        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Invoice payment failed')
        assert.deepEqual(embed.fields, [
            { name: 'Mode', value: 'Live', inline: true },
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Amount due', value: '45.00 EUR', inline: true },
            { name: 'Account ID', value: 'acct\\_123', inline: true },
            { name: 'Customer ID', value: 'cus\\_456', inline: true },
            { name: 'Subscription ID', value: 'sub\\_456', inline: true },
            { name: 'Invoice ID', value: 'in\\_123', inline: true },
            { name: 'Changed fields', value: 'Hosted invoice URL, Status', inline: false },
            { name: 'Event ID', value: 'evt\\_invoice\\_failed', inline: true },
        ])
        assert.doesNotMatch(JSON.stringify(result), /private@example\.com|example\.invalid/)
    })

    it('shows amount paid for successful invoice payments', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'invoice.payment_succeeded',
            data: {
                object: {
                    id: 'in_paid',
                    object: 'invoice',
                    amount_due: 4500,
                    amount_paid: 4500,
                    amount_remaining: 0,
                    currency: 'eur',
                    status: 'paid',
                },
            },
        })

        assert.notEqual(result, null)
        assert.ok(result!.embeds![0].fields?.some(({ name, value }) => name === 'Amount paid' && value === '45.00 EUR'))
    })

    it('shows the intended amount for failed PaymentIntents instead of a zero received amount', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'payment_intent.payment_failed',
            data: {
                object: {
                    id: 'pi_failed',
                    object: 'payment_intent',
                    amount: 2599,
                    amount_received: 0,
                    currency: 'usd',
                    status: 'requires_payment_method',
                },
            },
        })

        assert.notEqual(result, null)
        assert.ok(result!.embeds![0].fields?.some(({ name, value }) => name === 'Amount' && value === '25.99 USD'))
        assert.ok(!result!.embeds![0].fields?.some(({ name }) => name === 'Amount received'))
    })

    it('formats zero-decimal currencies using Stripe minor-unit rules', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'charge.succeeded',
            data: {
                object: {
                    id: 'ch_123',
                    object: 'charge',
                    amount: 500,
                    currency: 'jpy',
                    status: 'succeeded',
                },
            },
        })

        assert.notEqual(result, null)
        assert.ok(result!.embeds![0].fields?.some(({ name, value }) => name === 'Amount' && value === '500 JPY'))

        const ugx = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'charge.succeeded',
            data: { object: { id: 'ch_ugx', object: 'charge', amount: 500, currency: 'ugx' } },
        })
        assert.notEqual(ugx, null)
        assert.ok(ugx!.embeds![0].fields?.some(({ name, value }) => name === 'Amount' && value === '5.00 UGX'))
    })

    it('supports Stripe thin event notifications without requiring an API fetch', async () => {
        const result = await Tester.testWithBody(Stripe, {
            id: 'evt_test_65UIRNU7G1XbhCfOim416TgmEI4ASQ3jHxXt8RFwXoeVwO',
            object: 'v2.core.event',
            type: 'v2.core.account.updated',
            livemode: false,
            created: '2026-03-09T13:00:28.435Z',
            context: 'acct_context_123',
            related_object: {
                id: 'acct_1T93Q4Pmpb34Vto6',
                type: 'v2.core.account',
                url: '/v2/core/accounts/acct_1T93Q4Pmpb34Vto6',
            },
        })

        assert.notEqual(result, null)
        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Core account updated')
        assert.equal(embed.timestamp, '2026-03-09T13:00:28.435Z')
        assert.deepEqual(embed.fields, [
            { name: 'Mode', value: 'Test', inline: true },
            { name: 'Related object', value: 'Core account', inline: true },
            { name: 'Related object ID', value: 'acct\\_1T93Q4Pmpb34Vto6', inline: true },
            { name: 'Context', value: 'acct\\_context\\_123', inline: true },
            {
                name: 'Event ID',
                value: 'evt\\_test\\_65UIRNU7G1XbhCfOim416TgmEI4ASQ3jHxXt8RFwXoeVwO',
                inline: true,
            },
        ])
    })

    it('accepts documented v2 event types with bracketed selectors', async () => {
        for (const [eventType, expectedTitle] of [
            [
                'v2.core.account[configuration.customer].capability_status_updated',
                'Core account configuration customer capability status updated',
            ],
            ['v2.core.account[requirements].updated', 'Core account requirements updated'],
        ]) {
            const result = await Tester.testWithBody(Stripe, {
                id: 'evt_test_bracketed_selector',
                object: 'v2.core.event',
                type: eventType,
                livemode: false,
                created: '2026-03-09T13:00:28.435Z',
                related_object: {
                    id: 'acct_1T93Q4Pmpb34Vto6',
                    type: 'v2.core.account',
                    url: '/v2/core/accounts/acct_1T93Q4Pmpb34Vto6',
                },
            })

            assert.notEqual(result, null, eventType)
            assert.equal(result!.embeds![0].title, expectedTitle)
        }
    })

    it('handles future snapshot event families and deleted object snapshots generically', async () => {
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'future_resource.reviewed',
            data: {
                object: {
                    id: 'fr_123',
                    object: 'future_resource',
                    deleted: true,
                },
            },
        })

        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'Future resource reviewed')
        assert.ok(
            result!.embeds![0].fields?.some(({ name, value }) => name === 'Future resource ID' && value === 'fr\\_123'),
        )
    })

    it('accepts snapshot singleton resources without IDs and thin events without related objects', async () => {
        const singleton = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'balance.available',
            data: { object: { object: 'balance', livemode: false } },
        })
        assert.notEqual(singleton, null)
        assert.equal(singleton!.embeds![0].title, 'Balance available')
        assert.doesNotMatch(JSON.stringify(singleton), /Balance ID/)

        const thin = await Tester.testWithBody(Stripe, {
            id: 'evt_test_without_related_object',
            object: 'v2.core.event',
            type: 'v2.core.event_destination.ping',
            livemode: false,
            created: '2025-01-01T00:00:00.000Z',
            related_object: null,
        })
        assert.notEqual(thin, null)
        assert.equal(thin!.embeds![0].title, 'Core event destination ping')
        assert.deepEqual(thin!.embeds![0].fields, [
            { name: 'Mode', value: 'Test', inline: true },
            { name: 'Event ID', value: 'evt\\_test\\_without\\_related\\_object', inline: true },
        ])
    })

    it('rejects malformed snapshot and thin event envelopes', async () => {
        const validSnapshot = {
            ...snapshotEvent,
            type: 'customer.created',
            data: { object: { id: 'cus_123', object: 'customer' } },
        }
        const validThin = {
            id: 'evt_test_123',
            object: 'v2.core.event',
            type: 'v2.core.account.updated',
            livemode: false,
            created: '2026-03-09T13:00:28.435Z',
            related_object: { id: 'acct_123', type: 'v2.core.account', url: '/v2/core/accounts/acct_123' },
        }

        for (const body of [
            null,
            {},
            { ...validSnapshot, id: '' },
            { ...validSnapshot, object: 'not_event' },
            { ...validSnapshot, type: 'invalid event' },
            { ...validThin, type: 'v2.core.account[].updated' },
            { ...validThin, type: 'v2.core.account[requirements.updated' },
            { ...validThin, type: 'v2.core.account[[requirements]].updated' },
            { ...validSnapshot, created: -1 },
            { ...validSnapshot, created: Number.MAX_SAFE_INTEGER },
            { ...validSnapshot, livemode: 'false' },
            { ...validSnapshot, data: null },
            { ...validSnapshot, data: { object: null } },
            { ...validSnapshot, data: { object: { id: null, object: 'customer' } } },
            { ...validSnapshot, data: { object: { id: 'cus_123', object: '' } } },
            { ...validThin, created: '2026-02-31T00:00:00Z' },
            { ...validThin, related_object: { id: null, type: 'v2.core.account' } },
            { ...validThin, related_object: { id: '', type: 'v2.core.account' } },
        ]) {
            assert.equal(await Tester.testWithBody(Stripe, body), null)
        }
    })

    it('stays within Discord limits for long untrusted values', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const result = await Tester.testWithBody(Stripe, {
            ...snapshotEvent,
            type: 'payment_intent.payment_failed',
            data: {
                previous_attributes: Object.fromEntries(
                    Array.from({ length: 100 }, (_, index) => [`private_field_${index}_${longText}`, 'old']),
                ),
                object: {
                    id: 'pi_123',
                    object: 'payment_intent',
                    description: longText,
                    status: longText,
                    amount: 1234,
                    currency: 'usd',
                },
            },
        })

        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.deepEqual(validateDiscordPayload(result!), [])
        assert.doesNotMatch(result!.embeds![0].description ?? '', /\[click\]\(https:\/\/evil\.example\)/)
    })
})
