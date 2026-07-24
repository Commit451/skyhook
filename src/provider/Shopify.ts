import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DirectParseProvider } from '../provider/BaseProvider.ts'

const MAX_EMBED_CHARACTERS = 6000
const MAX_TITLE_CHARACTERS = 256
const MAX_FIELD_NAME_CHARACTERS = 256
const MAX_FIELD_VALUE_CHARACTERS = 1024
const MAX_FIELDS = 25
const FOOTER_TEXT = 'Powered by skyhookapi.com'
const ISO_8601_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/

const ACTION_LABELS: Record<string, string> = {
    activate: 'activated',
    add: 'added',
    approaching_capped_amount: 'approaching capped amount',
    assign: 'assigned',
    cancelled: 'cancelled',
    create: 'created',
    data_request: 'data requested',
    deactivate: 'deactivated',
    delete: 'deleted',
    finish: 'finished',
    fulfilled: 'fulfilled',
    in_stock: 'in stock',
    merge: 'merged',
    move: 'moved',
    out_of_stock: 'out of stock',
    paid: 'paid',
    partially_fulfilled: 'partially fulfilled',
    publish: 'published',
    redact: 'redaction requested',
    remove: 'removed',
    revoke: 'revoked',
    uninstalled: 'uninstalled',
    update: 'updated',
}

const FIELD_LABELS: Record<string, string> = {
    amount: 'Amount',
    available: 'Available',
    currency: 'Currency',
    financial_status: 'Payment',
    fulfillment_status: 'Fulfillment',
    inventory_item_id: 'Inventory item ID',
    location_id: 'Location ID',
    order_id: 'Order ID',
    price: 'Price',
    product_id: 'Product ID',
    status: 'Status',
    tracking_company: 'Tracking company',
    tracking_number: 'Tracking number',
}

const GENERIC_FIELD_KEYS = [
    'status',
    'available',
    'amount',
    'price',
    'currency',
    'financial_status',
    'fulfillment_status',
    'order_id',
    'product_id',
    'inventory_item_id',
    'location_id',
    'tracking_number',
    'tracking_company',
]

/**
 * Converts Shopify's resource webhook payloads into bounded Discord embeds.
 *
 * Shopify signs deliveries with an app-specific secret that skyhook does not possess,
 * so every header and body field is treated as untrusted display data.
 *
 * @see https://shopify.dev/docs/api/webhooks/latest
 * @see https://shopify.dev/docs/apps/build/webhooks/delivery-structure
 */
export class Shopify extends DirectParseProvider {
    constructor() {
        super()
        this.setEmbedColor(0x95bf47)
    }

    public getName(): string {
        return 'Shopify'
    }

    public getPath(): string {
        return 'shopify'
    }

    public async parseData(): Promise<void> {
        const topic = this.getHeader('x-shopify-topic').trim().toLowerCase()
        if (topic.length === 0 || !isRecord(this.body)) {
            this.nullifyPayload()
            return
        }

        const shopDomain = this.getShopDomain()
        const [resourcePart, actionPart] = splitTopic(topic)
        const resourceName = humanizeResource(resourcePart)
        const actionName = ACTION_LABELS[actionPart] ?? humanizeWords(actionPart).toLowerCase()
        const label = this.getResourceLabel(resourcePart)
        const title = truncateText(
            `${resourceName} ${actionName}${label == null ? '' : `: ${label}`}`,
            MAX_TITLE_CHARACTERS,
            true,
        )

        const embed: Embed = {
            title,
        }
        const adminUrl = this.createAdminUrl(resourcePart, shopDomain)
        if (adminUrl != null) {
            embed.url = adminUrl
        }

        const timestamp = this.getTimestamp()
        if (timestamp != null) {
            embed.timestamp = timestamp
        }

        if (shopDomain != null) {
            embed.author = {
                name: shopDomain,
                url: `https://${shopDomain}/admin`,
            }
        }

        const fields = this.createFields(resourcePart, actionPart)
        embed.fields = fitFields(embed, fields)

        this.payload.allowed_mentions = { parse: [] }
        this.addEmbed(embed)
    }

    private getHeader(name: string): string {
        if (this.headers == null) {
            return ''
        }
        if (typeof this.headers.get === 'function') {
            return String(this.headers.get(name) ?? '')
        }
        for (const [key, value] of Object.entries(this.headers)) {
            if (key.toLowerCase() === name) {
                return String(value ?? '')
            }
        }
        return ''
    }

    private getShopDomain(): string | null {
        const domain = this.getHeader('x-shopify-shop-domain').trim().toLowerCase()
        const shopName = domain.slice(0, -'.myshopify.com'.length)
        const validDomain =
            domain.length <= 253 &&
            shopName.length <= 63 &&
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.myshopify\.com$/.test(domain)
        return validDomain ? domain : null
    }

    private getResourceLabel(resource: string): string | null {
        let label: unknown
        if (resource === 'orders') {
            label = this.body.name ?? this.body.order_number
        } else if (resource === 'app') {
            label = this.body.name
        } else {
            label = this.body.title ?? this.body.name ?? this.body.handle ?? this.body.sku
        }
        return scalarText(label)
    }

    private getResourceId(): string | null {
        const graphQlId = scalarText(this.body.admin_graphql_api_id)
        if (graphQlId != null) {
            const match = /^gid:\/\/shopify\/[^/]+\/([^/?#]+)$/.exec(graphQlId)
            if (match != null) {
                return match[1]
            }
        }
        return safeId(this.body.id)
    }

    private createAdminUrl(resource: string, shopDomain: string | null): string | null {
        if (shopDomain == null) {
            return null
        }

        let adminResource: string | null = null
        let id: string | null = null
        if (resource === 'fulfillments' || resource === 'refunds') {
            adminResource = 'orders'
            id = safeAdminId(this.body.order_id)
        } else {
            const adminResources: Record<string, string> = {
                collections: 'collections',
                customers: 'customers',
                draft_orders: 'draft_orders',
                orders: 'orders',
                products: 'products',
                themes: 'themes',
            }
            adminResource = adminResources[resource] ?? null
            id = safeAdminId(this.getResourceId())
        }

        if (adminResource == null || id == null) {
            return null
        }
        return `https://${shopDomain}/admin/${adminResource}/${encodeURIComponent(id)}`
    }

    private getTimestamp(): string | null {
        const candidates = [
            this.getHeader('x-shopify-triggered-at'),
            this.body.updated_at,
            this.body.created_at,
            this.body.processed_at,
        ]
        for (const candidate of candidates) {
            const value = scalarText(candidate)
            if (value != null) {
                const timestamp = canonicalizeTimestamp(value)
                if (timestamp != null) {
                    return timestamp
                }
            }
        }
        return null
    }

    private createFields(resource: string, action: string): EmbedField[] {
        if (resource === 'app' && action === 'uninstalled') {
            return []
        }
        if (resource === 'orders') {
            return this.createOrderFields()
        }
        if (resource === 'products') {
            return this.createProductFields()
        }
        return this.createGenericFields()
    }

    private createOrderFields(): EmbedField[] {
        const fields: EmbedField[] = []
        const total = scalarText(this.body.current_total_price ?? this.body.total_price)
        const currency = scalarText(this.body.currency ?? this.body.presentment_currency)
        if (total != null) {
            fields.push({
                name: 'Total',
                value: currency == null ? total : `${total} ${currency}`,
                inline: true,
            })
        }

        const payment = scalarText(this.body.financial_status)
        if (payment != null) {
            fields.push({ name: 'Payment', value: humanizeWords(payment), inline: true })
        }

        const fulfillment = scalarText(this.body.fulfillment_status)
        fields.push({
            name: 'Fulfillment',
            value: fulfillment == null ? 'Unfulfilled' : humanizeWords(fulfillment),
            inline: true,
        })

        const customer = isRecord(this.body.customer) ? this.body.customer : null
        if (customer != null) {
            const customerName = [scalarText(customer.first_name), scalarText(customer.last_name)]
                .filter(Boolean)
                .join(' ')
            if (customerName.length > 0) {
                fields.push({ name: 'Customer', value: customerName, inline: true })
            }
        }

        if (Array.isArray(this.body.line_items) && this.body.line_items.length > 0) {
            const displayedItems = this.body.line_items.slice(0, 10)
            const lines = displayedItems.map((item: unknown) => {
                if (!isRecord(item)) {
                    return 'Unknown item'
                }
                const quantity = scalarText(item.quantity) ?? '1'
                const name = scalarText(item.name ?? item.title) ?? 'Unknown item'
                const sku = scalarText(item.sku)
                return `${quantity}× ${name}${sku == null ? '' : ` — SKU: ${sku}`}`
            })
            if (displayedItems.length < this.body.line_items.length) {
                lines.push(`…and ${this.body.line_items.length - displayedItems.length} more`)
            }
            fields.push({ name: 'Items', value: lines.join('\n'), inline: false })
        }
        return fields
    }

    private createProductFields(): EmbedField[] {
        const fields: EmbedField[] = []
        const status = scalarText(this.body.status)
        const vendor = scalarText(this.body.vendor)
        const productType = scalarText(this.body.product_type)
        if (status != null) {
            fields.push({ name: 'Status', value: humanizeWords(status), inline: true })
        }
        if (vendor != null) {
            fields.push({ name: 'Vendor', value: vendor, inline: true })
        }
        if (productType != null) {
            fields.push({ name: 'Product type', value: productType, inline: true })
        }
        if (Array.isArray(this.body.variants)) {
            fields.push({ name: 'Variants', value: String(this.body.variants.length), inline: true })
        }
        return fields
    }

    private createGenericFields(): EmbedField[] {
        const fields: EmbedField[] = []
        for (const key of GENERIC_FIELD_KEYS) {
            const value = key.endsWith('_id') ? safeId(this.body[key]) : scalarText(this.body[key])
            if (value == null) {
                continue
            }
            const shouldHumanize = key === 'status' || key === 'financial_status' || key === 'fulfillment_status'
            fields.push({
                name: FIELD_LABELS[key] ?? humanizeWords(key),
                value: shouldHumanize ? humanizeWords(value) : value,
                inline: true,
            })
        }
        return fields
    }
}

function splitTopic(topic: string): [string, string] {
    const parts = topic.split('/').filter(Boolean)
    if (parts.length < 2) {
        return [parts[0] ?? 'webhook', 'received']
    }
    return [parts.slice(0, -1).join('_'), parts.at(-1)!]
}

function humanizeResource(resource: string): string {
    const words = resource.split('_')
    const lastIndex = words.length - 1
    const word = words[lastIndex]
    if (word.endsWith('ies') && word.length > 3) {
        words[lastIndex] = `${word.slice(0, -3)}y`
    } else if (word.endsWith('s') && !word.endsWith('ss')) {
        words[lastIndex] = word.slice(0, -1)
    }
    return humanizeWords(words.join('_'))
}

function humanizeWords(value: string): string {
    const words = cleanText(value, true)
        .replace(/[._-]+/g, ' ')
        .toLowerCase()
    return words.length === 0 ? '' : words.charAt(0).toUpperCase() + words.slice(1)
}

function fitFields(embed: Embed, candidates: EmbedField[]): EmbedField[] {
    let usedCharacters =
        (embed.title?.length ?? 0) +
        (embed.description?.length ?? 0) +
        (embed.author?.name.length ?? 0) +
        FOOTER_TEXT.length
    const fields: EmbedField[] = []

    for (const candidate of candidates.slice(0, MAX_FIELDS)) {
        const name = truncateText(escapeDiscordMarkdown(candidate.name), MAX_FIELD_NAME_CHARACTERS, true)
        const remainingCharacters = MAX_EMBED_CHARACTERS - usedCharacters - name.length
        if (remainingCharacters <= 0) {
            break
        }
        const value = truncateText(
            escapeDiscordMarkdown(candidate.value),
            Math.min(MAX_FIELD_VALUE_CHARACTERS, remainingCharacters),
            false,
        )
        if (name.length === 0 || value.length === 0) {
            continue
        }
        fields.push({ name, value, inline: candidate.inline })
        usedCharacters += name.length + value.length
    }
    return fields
}

function safeId(value: unknown): string | null {
    if (typeof value === 'string') {
        const cleaned = cleanText(value, true)
        return cleaned.length > 0 ? cleaned : null
    }
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
        return String(value)
    }
    return null
}

function safeAdminId(value: unknown): string | null {
    const id = safeId(value)
    return id != null && /^\d{1,32}$/.test(id) ? id : null
}

function scalarText(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return null
    }
    const text = cleanText(String(value), false)
    return text.length > 0 ? text : null
}

function escapeDiscordMarkdown(value: string): string {
    return value.replace(/([\\`*_{}[\]()<>#+!|~])/g, '\\$1')
}

function canonicalizeTimestamp(value: string): string | null {
    const match = ISO_8601_TIMESTAMP.exec(value)
    if (match == null) {
        return null
    }

    const [, yearText, monthText, dayText, hourText, minuteText, secondText, fractionText, zone, sign] = match
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    const hour = Number(hourText)
    const minute = Number(minuteText)
    const second = Number(secondText)
    const millisecond = Number(`${fractionText ?? ''}000`.slice(0, 3))
    const offsetHour = zone === 'Z' ? 0 : Number(match[10])
    const offsetMinute = zone === 'Z' ? 0 : Number(match[11])
    if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour > 23 ||
        minute > 59 ||
        second > 59 ||
        offsetHour > 23 ||
        offsetMinute > 59
    ) {
        return null
    }

    const localDate = new Date(0)
    localDate.setUTCFullYear(year, month - 1, day)
    localDate.setUTCHours(hour, minute, second, millisecond)
    if (
        localDate.getUTCFullYear() !== year ||
        localDate.getUTCMonth() !== month - 1 ||
        localDate.getUTCDate() !== day ||
        localDate.getUTCHours() !== hour ||
        localDate.getUTCMinutes() !== minute ||
        localDate.getUTCSeconds() !== second
    ) {
        return null
    }

    const offsetSign = sign === '-' ? -1 : 1
    const offsetMilliseconds = offsetSign * (offsetHour * 60 + offsetMinute) * 60_000
    return new Date(localDate.getTime() - offsetMilliseconds).toISOString()
}

function truncateText(value: string, maxLength: number, singleLine: boolean): string {
    const cleaned = cleanText(value, singleLine)
    if (cleaned.length <= maxLength) {
        return cleaned
    }
    if (maxLength <= 1) {
        return '…'.slice(0, maxLength)
    }
    return `${cleaned.slice(0, maxLength - 1)}…`
}

function cleanText(value: string, singleLine: boolean): string {
    let cleaned = Array.from(value.replace(/\r\n?/g, '\n'))
        .filter((character) => {
            const code = character.charCodeAt(0)
            return code === 9 || code === 10 || (code > 31 && code !== 127)
        })
        .join('')
        .trim()
    if (singleLine) {
        cleaned = cleaned.replace(/\s+/g, ' ')
    }
    return cleaned
}

function isRecord(value: unknown): value is Record<string, any> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
}
