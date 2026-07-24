import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Shopify } from '../../src/provider/Shopify.ts'
import { Tester } from '../Tester.ts'

const headers = (topic: string, overrides: Record<string, string> = {}) => ({
    'x-shopify-topic': topic,
    'x-shopify-shop-domain': 'example-shop.myshopify.com',
    'x-shopify-api-version': '2026-07',
    'x-shopify-triggered-at': '2026-07-23T15:30:00.000Z',
    ...overrides,
})

describe('/POST shopify', () => {
    it('exposes provider metadata', () => {
        const provider = new Shopify()
        assert.strictEqual(provider.getName(), 'Shopify')
        assert.strictEqual(provider.getPath(), 'shopify')
    })

    it('formats an order creation from the documented payload', async () => {
        const res = await Tester.test(new Shopify(), 'shopify.json', headers('orders/create'))
        assert.notStrictEqual(res, null)
        assert.deepStrictEqual(res!.allowed_mentions, { parse: [] })
        assert.strictEqual(res!.embeds?.length, 1)

        const embed = res!.embeds![0]
        assert.strictEqual(embed.title, 'Order created: #9999')
        assert.strictEqual(embed.url, 'https://example-shop.myshopify.com/admin/orders/820982911946154508')
        assert.strictEqual(embed.timestamp, '2026-07-23T15:30:00.000Z')
        assert.strictEqual(embed.color, 0x95bf47)
        assert.deepStrictEqual(embed.author, {
            name: 'example-shop.myshopify.com',
            url: 'https://example-shop.myshopify.com/admin',
        })
        assert.deepStrictEqual(embed.fields, [
            { name: 'Total', value: '414.95 USD', inline: true },
            { name: 'Payment', value: 'Paid', inline: true },
            { name: 'Fulfillment', value: 'Unfulfilled', inline: true },
            { name: 'Customer', value: 'John Smith', inline: true },
            {
                name: 'Items',
                value: '1× Aviator sunglasses — SKU: SKU2006-001\n2× Lens Protection Plan \\(2 Year\\) — SKU: LENS-PROTECT-2YR',
                inline: false,
            },
        ])
    })

    it('formats a product update from the documented payload', async () => {
        const res = await Tester.test(new Shopify(), 'shopify-product.json', headers('products/update'))
        assert.notStrictEqual(res, null)

        const embed = res!.embeds![0]
        assert.strictEqual(embed.title, 'Product updated: Example T-Shirt')
        assert.strictEqual(embed.url, 'https://example-shop.myshopify.com/admin/products/788032119674292922')
        assert.deepStrictEqual(embed.fields, [
            { name: 'Status', value: 'Active', inline: true },
            { name: 'Vendor', value: 'Acme', inline: true },
            { name: 'Product type', value: 'Shirts', inline: true },
            { name: 'Variants', value: '2', inline: true },
        ])
    })

    it('handles any current or future topic with a safe generic summary', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                inventory_item_id: 808950810,
                location_id: 487838322,
                available: 75,
                updated_at: '2021-12-31T19:00:00-05:00',
            },
            headers('inventory_levels/update', {
                'x-shopify-shop-domain': 'merchant.myshopify.com',
                'x-shopify-triggered-at': '',
            }),
        )
        assert.notStrictEqual(res, null)

        const embed = res!.embeds![0]
        assert.strictEqual(embed.title, 'Inventory level updated')
        assert.strictEqual(embed.url, undefined)
        assert.strictEqual(embed.timestamp, '2022-01-01T00:00:00.000Z')
        assert.deepStrictEqual(embed.fields, [
            { name: 'Available', value: '75', inline: true },
            { name: 'Inventory item ID', value: '808950810', inline: true },
            { name: 'Location ID', value: '487838322', inline: true },
        ])
    })

    it('formats app uninstall events without exposing contact data', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                id: 548380009,
                name: 'Super Toys',
                email: 'super@supertoys.com',
                shop_owner: 'John Smith',
            },
            headers('app/uninstalled'),
        )
        assert.notStrictEqual(res, null)

        const embed = res!.embeds![0]
        assert.strictEqual(embed.title, 'App uninstalled: Super Toys')
        assert.deepStrictEqual(embed.fields, [])
        assert.ok(!JSON.stringify(res).includes('super@supertoys.com'))
        assert.ok(!JSON.stringify(res).includes('John Smith'))
    })

    it('ignores malformed requests without a Shopify topic', async () => {
        const res = await Tester.testWithBody(new Shopify(), { id: 1 }, headers('not-used', { 'x-shopify-topic': '' }))
        assert.strictEqual(res, null)
    })

    it('does not trust an invalid shop domain for links', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                admin_graphql_api_id: 'gid://shopify/Product/123',
                title: 'Unsafe product',
            },
            headers('products/update', { 'x-shopify-shop-domain': 'example.com/path' }),
        )
        assert.notStrictEqual(res, null)
        assert.strictEqual(res!.embeds![0].url, undefined)
        assert.strictEqual(res!.embeds![0].author, undefined)
    })

    it('rejects oversized shop domains and resource IDs before building Discord links', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                admin_graphql_api_id: `gid://shopify/Product/${'1'.repeat(3000)}`,
                title: 'Oversized identifiers',
            },
            headers('products/update', {
                'x-shopify-shop-domain': `${'a'.repeat(300)}.myshopify.com`,
            }),
        )
        assert.notStrictEqual(res, null)
        assert.strictEqual(res!.embeds![0].url, undefined)
        assert.strictEqual(res!.embeds![0].author, undefined)
    })

    it('does not display rounded 64-bit Shopify IDs', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                inventory_item_id: Number('820982911946154508'),
                location_id: '487838322',
                available: 75,
            },
            headers('inventory_levels/update'),
        )
        assert.notStrictEqual(res, null)
        assert.deepStrictEqual(res!.embeds![0].fields, [
            { name: 'Available', value: '75', inline: true },
            { name: 'Location ID', value: '487838322', inline: true },
        ])
    })

    it('does not forward malformed or oversized timestamps to Discord', async () => {
        for (const timestamp of ['0', '2026-02-31T00:00:00.000Z', '2026-07-23T15:30:00.12345678901234567890Z']) {
            const res = await Tester.testWithBody(
                new Shopify(),
                { available: 75 },
                headers('inventory_levels/update', { 'x-shopify-triggered-at': timestamp }),
            )
            assert.notStrictEqual(res, null)
            assert.strictEqual(res!.embeds![0].timestamp, undefined)
        }
    })

    it('escapes untrusted Discord Markdown in embed fields', async () => {
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                title: 'Safe title',
                status: '**active**',
                vendor: '[Trusted](https://evil.example)',
                product_type: '`code`',
                variants: [],
            },
            headers('products/update'),
        )
        assert.notStrictEqual(res, null)
        assert.deepStrictEqual(res!.embeds![0].fields, [
            { name: 'Status', value: '\\*\\*active\\*\\*', inline: true },
            { name: 'Vendor', value: '\\[Trusted\\]\\(https://evil.example\\)', inline: true },
            { name: 'Product type', value: '\\`code\\`', inline: true },
            { name: 'Variants', value: '0', inline: true },
        ])
    })

    it('stays inside Discord embed limits for long untrusted values', async () => {
        const longText = '@everyone ' + 'x'.repeat(7000)
        const res = await Tester.testWithBody(
            new Shopify(),
            {
                admin_graphql_api_id: 'gid://shopify/Product/123',
                title: longText,
                status: longText,
                vendor: longText,
                product_type: longText,
                variants: new Array(100).fill({ title: longText }),
            },
            headers('products/update'),
        )
        assert.notStrictEqual(res, null)

        const embed = res!.embeds![0]
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
        assert.deepStrictEqual(res!.allowed_mentions, { parse: [] })
    })
})
