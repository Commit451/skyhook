import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { app } from '../../src/index.ts'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { RevenueCat } from '../../src/provider/RevenueCat.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'
import { Tester } from '../Tester.ts'

const eventEnvelope = (event: Record<string, unknown>, apiVersion: unknown = '1.0') => ({
    event: {
        id: 'evt_123',
        event_timestamp_ms: 1785175200000,
        ...event,
    },
    api_version: apiVersion,
})

describe('/POST revenuecat', () => {
    it('advertises and accepts the RevenueCat webhook endpoint', async () => {
        const providersResponse = await app.request('/api/providers')
        assert.equal(providersResponse.status, 200)
        const providers = (await providersResponse.json()) as { name: string; path: string }[]

        assert.deepEqual(
            providers.find((provider) => provider.path === 'revenuecat'),
            { name: 'RevenueCat', path: 'revenuecat' },
        )
        assert.equal((await app.request('/api/webhooks/example-id/example-secret/revenuecat')).status, 200)
    })

    it('formats the packaged RevenueCat initial-purchase example', async () => {
        assert.equal(RevenueCat.name, 'RevenueCat')
        assert.equal(RevenueCat.path, 'revenuecat')

        const example = loadProviderExample('revenuecat')
        const result = await Tester.testWithBody(RevenueCat, example.body, example.headers, example.query)

        assert.notEqual(result, null)
        assert.equal(result!.username, 'RevenueCat')
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds?.length, 1)
        assert.equal(result!.embeds![0].title, 'Initial purchase')
        assert.equal(result!.embeds![0].timestamp, '2022-07-25T05:19:38.679Z')
        assert.equal(result!.embeds![0].color, 0xf2545b)
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Product', value: 'com.subscription.weekly', inline: true },
            { name: 'Price', value: '4.99 USD', inline: true },
            { name: 'Period', value: 'Normal', inline: true },
            { name: 'Entitlements', value: 'pro', inline: false },
            { name: 'Expires', value: '2022-08-01T05:19:34.000Z', inline: true },
            { name: 'Transaction ID', value: '123456789012345', inline: true },
            { name: 'App user ID', value: '1234567890', inline: true },
            { name: 'Store', value: 'App Store', inline: true },
            { name: 'Environment', value: 'Production', inline: true },
            { name: 'Event ID', value: '12345678-1234-1234-1234-123456789012', inline: true },
        ])
        assert.doesNotMatch(JSON.stringify(result), /firstlast@gmail\.com|subscriber_attributes|aliases/)
        assert.deepEqual(validateDiscordPayload(result!), [])
    })

    it('summarizes lifecycle reasons, product changes, and RevenueCat major-unit prices', async () => {
        const cancellation = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'CANCELLATION',
                app_user_id: 'user_123',
                product_id: 'monthly_pro',
                entitlement_ids: ['pro_access'],
                period_type: 'TRIAL',
                price_in_purchased_currency: -9.99,
                price: -9.99,
                currency: 'EUR',
                cancel_reason: 'CUSTOMER_SUPPORT',
                expiration_at_ms: 1785261600000,
                transaction_id: 'txn_123',
                store: 'RC_BILLING',
                environment: 'SANDBOX',
            }),
        )

        assert.notEqual(cancellation, null)
        assert.equal(cancellation!.embeds![0].title, 'Cancellation')
        assert.equal(cancellation!.embeds![0].timestamp, '2026-07-27T18:00:00.000Z')
        assert.deepEqual(cancellation!.embeds![0].fields, [
            { name: 'Product', value: 'monthly\\_pro', inline: true },
            { name: 'Price', value: '-9.99 EUR', inline: true },
            { name: 'Period', value: 'Trial', inline: true },
            { name: 'Entitlements', value: 'pro\\_access', inline: false },
            { name: 'Reason', value: 'Customer Support', inline: true },
            { name: 'Expires', value: '2026-07-28T18:00:00.000Z', inline: true },
            { name: 'Transaction ID', value: 'txn\\_123', inline: true },
            { name: 'App user ID', value: 'user\\_123', inline: true },
            { name: 'Store', value: 'RevenueCat Billing', inline: true },
            { name: 'Environment', value: 'Sandbox', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])

        const productChange = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'PRODUCT_CHANGE',
                product_id: 'monthly',
                new_product_id: 'yearly',
                app_user_id: 'user',
            }),
        )
        assert.notEqual(productChange, null)
        assert.ok(
            productChange!.embeds![0].fields?.some(({ name, value }) => name === 'New product' && value === 'yearly'),
        )
    })

    it('summarizes transfers and purchase redemptions', async () => {
        const transfer = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'TRANSFER',
                transferred_from: ['old_user', '$RCAnonymousID:old'],
                transferred_to: ['new_user'],
                store: 'APP_STORE',
                environment: 'PRODUCTION',
            }),
        )
        assert.notEqual(transfer, null)
        assert.deepEqual(transfer!.embeds![0].fields, [
            { name: 'Transferred from', value: 'old\\_user, $RCAnonymousID:old', inline: false },
            { name: 'Transferred to', value: 'new\\_user', inline: false },
            { name: 'Store', value: 'App Store', inline: true },
            { name: 'Environment', value: 'Production', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])

        const redeemed = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'PURCHASE_REDEEMED',
                redeemed_from: ['$RCAnonymousID:original'],
                redeemed_by: ['user_456'],
                redemption_outcome: 'transfer',
                redemption_platform: 'ios',
                product_id: 'premium_monthly',
                entitlement_ids: ['premium'],
                store: 'STRIPE',
                environment: 'PRODUCTION',
            }),
        )
        assert.notEqual(redeemed, null)
        assert.equal(redeemed!.embeds![0].title, 'Purchase redeemed')
        assert.deepEqual(redeemed!.embeds![0].fields, [
            { name: 'Outcome', value: 'Transfer', inline: true },
            { name: 'Redeemed from', value: '$RCAnonymousID:original', inline: false },
            { name: 'Redeemed by', value: 'user\\_456', inline: false },
            { name: 'Platform', value: 'iOS', inline: true },
            { name: 'Product', value: 'premium\\_monthly', inline: true },
            { name: 'Entitlements', value: 'premium', inline: false },
            { name: 'Store', value: 'Stripe', inline: true },
            { name: 'Environment', value: 'Production', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])
    })

    it('summarizes virtual currency transactions and experiment enrollment', async () => {
        const currency = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'VIRTUAL_CURRENCY_TRANSACTION',
                adjustments: [
                    {
                        amount: 100,
                        currency: { code: 'CRD', name: 'Credits', description: 'Main credits' },
                    },
                ],
                source: 'in_app_purchase',
                virtual_currency_transaction_id: 'vatx_123',
                product_id: 'monthly_credits',
                app_user_id: 'user_123',
                store: 'PLAY_STORE',
                purchase_environment: 'PRODUCTION',
            }),
        )
        assert.notEqual(currency, null)
        assert.deepEqual(currency!.embeds![0].fields, [
            { name: 'Adjustment', value: '100 Credits \\(CRD\\)', inline: false },
            { name: 'Source', value: 'In App Purchase', inline: true },
            { name: 'Virtual currency transaction ID', value: 'vatx\\_123', inline: true },
            { name: 'Product', value: 'monthly\\_credits', inline: true },
            { name: 'App user ID', value: 'user\\_123', inline: true },
            { name: 'Store', value: 'Google Play', inline: true },
            { name: 'Environment', value: 'Production', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])

        const experiment = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'EXPERIMENT_ENROLLMENT',
                experiment_id: 'prexp_123',
                experiment_variant: 'b',
                offering_id: 'experiment_offering_b',
                experiment_enrolled_at_ms: 1785175200000,
                app_user_id: 'user_123',
            }),
        )
        assert.notEqual(experiment, null)
        assert.deepEqual(experiment!.embeds![0].fields, [
            { name: 'Experiment ID', value: 'prexp\\_123', inline: true },
            { name: 'Variant', value: 'b', inline: true },
            { name: 'Offering', value: 'experiment\\_offering\\_b', inline: true },
            { name: 'Enrolled at', value: '2026-07-27T18:00:00.000Z', inline: true },
            { name: 'App user ID', value: 'user\\_123', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])
    })

    it('summarizes paywall interactions, including custom event names', async () => {
        const result = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'CUSTOM_PAYWALL_PACKAGE_CHANGED',
                app_user_id: '$RCAnonymousID:user',
                environment: 'SANDBOX',
                paywall_id: 'pw_123',
                paywall_name: 'Pro **Paywall**',
                offering_id: 'monthly_offer',
                event_id: 'paywall_event_123',
                session_id: 'session_123',
                platform: 'iOS',
                component_type: 'package',
                component_value: '@everyone monthly',
            }),
        )

        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'Custom paywall package changed')
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Paywall', value: 'Pro \\*\\*Paywall\\*\\*', inline: true },
            { name: 'Paywall ID', value: 'pw\\_123', inline: true },
            { name: 'Offering', value: 'monthly\\_offer', inline: true },
            { name: 'Component', value: 'Package', inline: true },
            { name: 'Component value', value: '@everyone monthly', inline: false },
            { name: 'Platform', value: 'iOS', inline: true },
            { name: 'Paywall event ID', value: 'paywall\\_event\\_123', inline: true },
            { name: 'Session ID', value: 'session\\_123', inline: true },
            { name: 'App user ID', value: '$RCAnonymousID:user', inline: true },
            { name: 'Environment', value: 'Sandbox', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])
        assert.deepEqual(result!.allowed_mentions, { parse: [] })

        const collidingCustomName = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'TRANSFER',
                paywall_id: 'paywall_collision',
                paywall_name: 'Collision-safe paywall',
                event_id: 'paywall_ui_collision',
                session_id: 'paywall_session_collision',
                transferred_from: ['should_not_render'],
            }),
        )
        assert.notEqual(collidingCustomName, null)
        assert.deepEqual(collidingCustomName!.embeds![0].fields, [
            { name: 'Paywall', value: 'Collision-safe paywall', inline: true },
            { name: 'Paywall ID', value: 'paywall\\_collision', inline: true },
            { name: 'Paywall event ID', value: 'paywall\\_ui\\_collision', inline: true },
            { name: 'Session ID', value: 'paywall\\_session\\_collision', inline: true },
            { name: 'Event ID', value: 'evt\\_123', inline: true },
        ])
    })

    it('accepts every documented RevenueCat event type', async () => {
        const documentedEventTypes = [
            'TEST',
            'INITIAL_PURCHASE',
            'RENEWAL',
            'CANCELLATION',
            'UNCANCELLATION',
            'NON_RENEWING_PURCHASE',
            'SUBSCRIPTION_PAUSED',
            'EXPIRATION',
            'BILLING_ISSUE',
            'PRODUCT_CHANGE',
            'SUBSCRIPTION_EXTENDED',
            'REFUND_REVERSED',
            'INVOICE_ISSUANCE',
            'TRANSFER',
            'TEMPORARY_ENTITLEMENT_GRANT',
            'VIRTUAL_CURRENCY_TRANSACTION',
            'EXPERIMENT_ENROLLMENT',
            'PURCHASE_REDEEMED',
            'PAYWALL_IMPRESSION',
            'PAYWALL_CLOSE',
            'PAYWALL_CANCEL',
            'PAYWALL_EXIT_OFFER',
            'PAYWALL_COMPONENT_INTERACTED',
            'SUBSCRIBER_ALIAS',
            'PRICE_INCREASE_CONSENT_REQUIRED',
            'PRICE_INCREASE_CONSENT_APPROVED',
        ]

        for (const eventType of documentedEventTypes) {
            const result = await Tester.testWithBody(RevenueCat, eventEnvelope({ type: eventType }))
            assert.notEqual(result, null, eventType)
            assert.equal(
                result!.embeds![0].title,
                eventType
                    .toLowerCase()
                    .replaceAll('_', ' ')
                    .replace(/^./, (c) => c.toUpperCase()),
            )
        }
    })

    it('handles temporary grants, price-consent events, and future event types generically', async () => {
        const temporaryGrant = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'TEMPORARY_ENTITLEMENT_GRANT',
                app_user_id: 'user_123',
                store: 'APP_STORE',
            }),
        )
        assert.notEqual(temporaryGrant, null)
        assert.equal(temporaryGrant!.embeds![0].title, 'Temporary entitlement grant')

        const consent = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'PRICE_INCREASE_CONSENT_REQUIRED',
                app_user_id: 'user_123',
                product_id: 'premium',
                transaction_id: 'txn_123',
                store: 'APP_STORE',
                environment: 'PRODUCTION',
            }),
        )
        assert.notEqual(consent, null)
        assert.equal(consent!.embeds![0].title, 'Price increase consent required')
        assert.ok(consent!.embeds![0].fields?.some(({ name, value }) => name === 'Product' && value === 'premium'))

        const future = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'FUTURE_EVENT_FAMILY',
                app_user_id: 'user_123',
                store: 'TEST_STORE',
                environment: 'SANDBOX',
            }),
        )
        assert.notEqual(future, null)
        assert.equal(future!.embeds![0].title, 'Future event family')
        assert.ok(future!.embeds![0].fields?.some(({ name, value }) => name === 'Event ID' && value === 'evt\\_123'))
    })

    it('rejects malformed common webhook envelopes', async () => {
        const valid = eventEnvelope({ type: 'INITIAL_PURCHASE' })
        for (const body of [
            null,
            {},
            { ...valid, api_version: null },
            { ...valid, api_version: 'x'.repeat(33) },
            { ...valid, event: null },
            { ...valid, event: { ...valid.event, id: null } },
            { ...valid, event: { ...valid.event, id: '' } },
            { ...valid, event: { ...valid.event, type: null } },
            { ...valid, event: { ...valid.event, type: '' } },
            { ...valid, event: { ...valid.event, type: '___' } },
            { ...valid, event: { ...valid.event, event_timestamp_ms: -1 } },
            { ...valid, event: { ...valid.event, event_timestamp_ms: 253_402_300_800_000 } },
            { ...valid, event: { ...valid.event, event_timestamp_ms: Number.MAX_SAFE_INTEGER } },
            { ...valid, event: { ...valid.event, event_timestamp_ms: '1785175200000' } },
        ]) {
            assert.equal(await Tester.testWithBody(RevenueCat, body), null)
        }
    })

    it('stays within Discord limits and escapes long untrusted values', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const result = await Tester.testWithBody(
            RevenueCat,
            eventEnvelope({
                type: 'CUSTOM_[click](https://evil.example)',
                app_user_id: longText,
                product_id: longText,
                entitlement_ids: Array.from({ length: 100 }, (_, index) => `${longText}_${index}`),
                subscriber_attributes: {
                    private: { value: 'do-not-render', updated_at_ms: 1785175200000 },
                },
            }),
        )

        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.deepEqual(validateDiscordPayload(result!), [])
        assert.doesNotMatch(JSON.stringify(result), /do-not-render|subscriber_attributes/)
        assert.doesNotMatch(result!.embeds![0].title ?? '', /\[click\]\(https:\/\/evil\.example\)/)
    })
})
