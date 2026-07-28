import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DISCORD_EMBED_LIMITS, fitLiteralEmbedFields } from '../util/DiscordEmbed.ts'
import { cleanText, escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../util/DiscordText.ts'
import { isRecord, scalarText } from '../util/WebhookValue.ts'
import { defineProvider } from './Provider.ts'

const MAX_API_VERSION_CHARACTERS = 32
const MAX_EVENT_TYPE_CHARACTERS = 200
const MAX_EVENT_ID_CHARACTERS = 512
const MAX_FIELD_SOURCE_CHARACTERS = 2_048
const MAX_LIST_ITEMS = 10
const MAX_ADJUSTMENTS = 8
const MAX_UNIX_TIMESTAMP_MILLISECONDS = 253_402_300_799_999

const ENUM_LABELS: Readonly<Record<string, string>> = {
    AMAZON: 'Amazon',
    ANDROID: 'Android',
    APP_STORE: 'App Store',
    ADMIN_API: 'Admin API',
    CLIENT_SDK: 'Client SDK',
    CUSTOMER_SUPPORT: 'Customer Support',
    IN_APP_PURCHASE: 'In App Purchase',
    IOS: 'iOS',
    MACOS: 'macOS',
    MAC_APP_STORE: 'Mac App Store',
    PLAY_STORE: 'Google Play',
    RC_BILLING: 'RevenueCat Billing',
    ROKU: 'Roku',
    SERVER_API: 'Server API',
    TEST_STORE: 'Test Store',
    WEB: 'Web',
}

/**
 * Converts RevenueCat webhook events into bounded Discord embeds.
 *
 * @see https://www.revenuecat.com/docs/integrations/webhooks
 * @see https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
export const RevenueCat = defineProvider({
    path: 'revenuecat',
    name: 'RevenueCat',
    example: { body: 'revenuecat/revenuecat.json' },
    defaults: {
        username: 'RevenueCat',
        embedColor: 0xf2545b,
    },
    map({ body }, output) {
        const apiVersion = requiredText(body.api_version, MAX_API_VERSION_CHARACTERS)
        const event = isRecord(body.event) ? body.event : null
        const eventId = requiredText(event?.id, MAX_EVENT_ID_CHARACTERS)
        const eventType = requiredText(event?.type, MAX_EVENT_TYPE_CHARACTERS)
        const timestamp = revenueCatTimestamp(event?.event_timestamp_ms)
        const title =
            eventType == null ? '' : boundedLiteral(humanizeWords(eventType), DISCORD_EMBED_LIMITS.title, true)
        if (
            apiVersion == null ||
            event == null ||
            eventId == null ||
            eventType == null ||
            timestamp == null ||
            title.length === 0
        ) {
            output.ignore()
            return
        }

        const embed: Embed = {
            title,
            timestamp,
        }
        embed.fields = fitLiteralEmbedFields(embed, createFields(event, eventType, eventId))
        output.addEmbed(embed)
    },
})

function createFields(event: Record<string, any>, eventType: string, eventId: string): EmbedField[] {
    const fields: EmbedField[] = []

    if (isPaywallEvent(eventType, event)) {
        addTextField(fields, 'Paywall', event.paywall_name)
        addTextField(fields, 'Paywall ID', event.paywall_id)
        addTextField(fields, 'Offering', event.offering_id)
        addEnumField(fields, 'Component', event.component_type)
        addTextField(fields, 'Component value', event.component_value, false)
        addEnumField(fields, 'Platform', event.platform)
        addTextField(fields, 'Paywall event ID', event.event_id)
        addTextField(fields, 'Session ID', event.session_id)
    } else if (eventType === 'TRANSFER') {
        addListField(fields, 'Transferred from', event.transferred_from)
        addListField(fields, 'Transferred to', event.transferred_to)
    } else if (eventType === 'VIRTUAL_CURRENCY_TRANSACTION') {
        addTextField(fields, 'Adjustment', adjustmentSummary(event.adjustments), false)
        addEnumField(fields, 'Source', event.source)
        addTextField(fields, 'Virtual currency transaction ID', event.virtual_currency_transaction_id)
        addTextField(fields, 'Product', event.product_id)
    } else if (eventType === 'EXPERIMENT_ENROLLMENT') {
        addTextField(fields, 'Experiment ID', event.experiment_id)
        addTextField(fields, 'Variant', event.experiment_variant)
        addTextField(fields, 'Offering', event.offering_id)
        addTimestampField(fields, 'Enrolled at', event.experiment_enrolled_at_ms)
    } else if (eventType === 'PURCHASE_REDEEMED') {
        addEnumField(fields, 'Outcome', event.redemption_outcome)
        addListField(fields, 'Redeemed from', event.redeemed_from)
        addListField(fields, 'Redeemed by', event.redeemed_by)
        addEnumField(fields, 'Platform', event.redemption_platform)
        addTextField(fields, 'Product', event.product_id)
        addListField(fields, 'Entitlements', event.entitlement_ids)
    } else {
        addPurchaseFields(fields, event)
    }

    addTextField(fields, 'App user ID', event.app_user_id)
    addEnumField(fields, 'Store', event.store)
    addEnumField(fields, 'Environment', event.environment ?? event.purchase_environment)
    addTextField(fields, 'Event ID', eventId)
    return fields
}

function addPurchaseFields(fields: EmbedField[], event: Record<string, any>): void {
    addTextField(fields, 'Product', event.product_id)
    addTextField(fields, 'Price', revenueCatPrice(event))
    addTextField(fields, 'New product', event.new_product_id)
    addEnumField(fields, 'Period', event.period_type)
    addListField(fields, 'Entitlements', event.entitlement_ids)
    addEnumField(fields, 'Reason', event.cancel_reason ?? event.expiration_reason)
    addTimestampField(fields, 'Expires', event.expiration_at_ms)
    addTimestampField(fields, 'Grace period ends', event.grace_period_expiration_at_ms)
    addTimestampField(fields, 'Auto resumes', event.auto_resume_at_ms)
    addTextField(fields, 'Transaction ID', event.transaction_id)
}

function addTextField(fields: EmbedField[], name: string, value: unknown, inline = true): void {
    const text = boundedFieldText(value)
    if (text != null) {
        fields.push({ name, value: text, inline })
    }
}

function addEnumField(fields: EmbedField[], name: string, value: unknown, inline = true): void {
    const text = boundedFieldText(value)
    if (text != null) {
        fields.push({ name, value: enumLabel(text), inline })
    }
}

function addTimestampField(fields: EmbedField[], name: string, value: unknown): void {
    const timestamp = revenueCatTimestamp(value)
    if (timestamp != null) {
        fields.push({ name, value: timestamp, inline: true })
    }
}

function addListField(fields: EmbedField[], name: string, value: unknown): void {
    const list = stringList(value)
    if (list != null) {
        fields.push({ name, value: list, inline: false })
    }
}

function stringList(value: unknown): string | null {
    if (!Array.isArray(value)) {
        return null
    }
    const items = value.map(boundedFieldText).filter((item): item is string => item != null)
    if (items.length === 0) {
        return null
    }
    const visible = items.slice(0, MAX_LIST_ITEMS)
    const suffix = items.length > visible.length ? ` (+${items.length - visible.length} more)` : ''
    return `${visible.join(', ')}${suffix}`
}

function adjustmentSummary(value: unknown): string | null {
    if (!Array.isArray(value)) {
        return null
    }
    const adjustments: string[] = []
    for (const candidate of value.slice(0, MAX_ADJUSTMENTS)) {
        if (!isRecord(candidate) || !Number.isSafeInteger(candidate.amount) || !isRecord(candidate.currency)) {
            continue
        }
        const code = requiredText(candidate.currency.code, 64)
        const name = requiredText(candidate.currency.name, 128) ?? code
        if (code == null || name == null) {
            continue
        }
        adjustments.push(`${candidate.amount} ${name}${name === code ? '' : ` (${code})`}`)
    }
    if (adjustments.length === 0) {
        return null
    }
    const omitted = value.length - adjustments.length
    return `${adjustments.join(', ')}${omitted > 0 ? ` (+${omitted} more)` : ''}`
}

function revenueCatPrice(event: Record<string, any>): string | null {
    const currency = currencyCode(event.currency)
    const purchasedPrice = finitePrice(event.price_in_purchased_currency)
    if (currency != null && purchasedPrice != null) {
        return formatPrice(purchasedPrice, currency)
    }

    const usdPrice = finitePrice(event.price)
    return usdPrice == null ? null : formatPrice(usdPrice, 'USD')
}

function formatPrice(value: number, currency: string): string | null {
    try {
        const fractionDigits =
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
            }).resolvedOptions().maximumFractionDigits ?? 2
        return `${value.toFixed(fractionDigits)} ${currency}`
    } catch {
        return null
    }
}

function finitePrice(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
        ? value
        : null
}

function currencyCode(value: unknown): string | null {
    return typeof value === 'string' && /^[A-Za-z]{3}$/.test(value) ? value.toUpperCase() : null
}

function isPaywallEvent(eventType: string, event: Record<string, any>): boolean {
    return eventType.startsWith('PAYWALL_') || event.paywall_id != null || event.paywall_name != null
}

function requiredText(value: unknown, maxLength: number): string | null {
    if (typeof value !== 'string') {
        return null
    }
    const text = cleanText(value, true)
    return text.length > 0 && text.length <= maxLength ? text : null
}

function boundedFieldText(value: unknown): string | null {
    const text = scalarText(value)
    return text == null ? null : truncateText(text, MAX_FIELD_SOURCE_CHARACTERS, false)
}

function revenueCatTimestamp(value: unknown): string | null {
    if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > MAX_UNIX_TIMESTAMP_MILLISECONDS) {
        return null
    }
    try {
        return new Date(Number(value)).toISOString()
    } catch {
        return null
    }
}

function enumLabel(value: string): string {
    return ENUM_LABELS[value.toUpperCase()] ?? humanizeWords(value)
}

function boundedLiteral(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdownLiteral(value), maxLength, singleLine)
}
