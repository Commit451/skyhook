import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DISCORD_EMBED_LIMITS, fitLiteralEmbedFields } from '../util/DiscordEmbed.ts'
import { escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../util/DiscordText.ts'
import { canonicalizeIso8601Timestamp, firstScalar, isRecord, safeId, scalarText } from '../util/WebhookValue.ts'
import { defineProvider, type ProviderOutput } from './Provider.ts'

const EVENT_TYPE_PATTERN =
    /^[a-z0-9_]+(?:\[[a-z0-9_]+(?:\.[a-z0-9_]+)*\])?(?:\.[a-z0-9_]+(?:\[[a-z0-9_]+(?:\.[a-z0-9_]+)*\])?)+$/
const OBJECT_TYPE_PATTERN = /^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/
const STRIPE_ID_PATTERN = /^[A-Za-z0-9_]+$/
const MAX_EVENT_TYPE_CHARACTERS = 200
const MAX_OBJECT_TYPE_CHARACTERS = 200
const MAX_ID_CHARACTERS = 255
const MAX_CHANGED_FIELDS = 20
const MAX_CHANGED_FIELD_LABEL_CHARACTERS = 80
const MAX_UNIX_TIMESTAMP_SECONDS = 253_402_300_799
const ZERO_DECIMAL_CURRENCIES = new Set([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
])

const AMOUNT_FIELDS = [
    ['amount_received', 'Amount received'],
    ['amount_paid', 'Amount paid'],
    ['amount_due', 'Amount due'],
    ['amount_refunded', 'Amount refunded'],
    ['amount_captured', 'Amount captured'],
    ['amount_total', 'Amount total'],
    ['total', 'Total'],
    ['amount', 'Amount'],
] as const

const PAYMENT_INTENT_SUCCEEDED_AMOUNT_FIELDS = [
    ['amount_received', 'Amount received'],
    ['amount', 'Amount'],
] as const
const PAYMENT_INTENT_AMOUNT_FIELDS = [
    ['amount', 'Amount'],
    ['amount_received', 'Amount received'],
] as const
const INVOICE_PAID_AMOUNT_FIELDS = [
    ['amount_paid', 'Amount paid'],
    ['amount_due', 'Amount due'],
    ['amount_remaining', 'Amount remaining'],
    ['total', 'Total'],
] as const
const INVOICE_OUTSTANDING_AMOUNT_FIELDS = [
    ['amount_due', 'Amount due'],
    ['amount_remaining', 'Amount remaining'],
    ['amount_paid', 'Amount paid'],
    ['total', 'Total'],
] as const
const CHARGE_AMOUNT_FIELDS = [
    ['amount', 'Amount'],
    ['amount_captured', 'Amount captured'],
    ['amount_refunded', 'Amount refunded'],
] as const
const CHARGE_REFUNDED_AMOUNT_FIELDS = [
    ['amount_refunded', 'Amount refunded'],
    ['amount', 'Amount'],
] as const
const CHECKOUT_SESSION_AMOUNT_FIELDS = [
    ['amount_total', 'Amount total'],
    ['amount_subtotal', 'Amount subtotal'],
] as const

/**
 * Converts Stripe snapshot Event objects and v2 thin event notifications into bounded Discord embeds.
 *
 * @see https://docs.stripe.com/webhooks
 * @see https://docs.stripe.com/api/events/object
 * @see https://docs.stripe.com/event-destinations#events-overview
 */
export const Stripe = defineProvider({
    path: 'stripe',
    name: 'Stripe',
    example: { body: 'stripe/stripe.json' },
    defaults: {
        username: 'Stripe',
        embedColor: 0x635bff,
    },
    map({ body }, output) {
        const eventId = stripeId(body.id)
        const eventType = boundedType(body.type, EVENT_TYPE_PATTERN, MAX_EVENT_TYPE_CHARACTERS)
        if (eventId == null || eventType == null || typeof body.livemode !== 'boolean') {
            output.ignore()
            return
        }

        if (body.object === 'event') {
            mapSnapshotEvent(body, eventId, eventType, output)
            return
        }
        if (body.object === 'v2.core.event') {
            mapThinEvent(body, eventId, eventType, output)
            return
        }
        output.ignore()
    },
})

function mapSnapshotEvent(body: Record<string, any>, eventId: string, eventType: string, output: ProviderOutput): void {
    const timestamp = stripeUnixTimestamp(body.created)
    const data = isRecord(body.data) ? body.data : null
    const object = isRecord(data?.object) ? data.object : null
    const objectType = boundedType(object?.object, OBJECT_TYPE_PATTERN, MAX_OBJECT_TYPE_CHARACTERS)
    const hasObjectId = object != null && Object.hasOwn(object, 'id')
    const objectId = hasObjectId ? stripeId(object.id) : null
    const accountId = optionalStripeId(body, 'account')
    const context = optionalStripeId(body, 'context')
    if (
        timestamp == null ||
        data == null ||
        object == null ||
        objectType == null ||
        (hasObjectId && objectId == null) ||
        accountId === false ||
        context === false
    ) {
        output.ignore()
        return
    }

    const embed: Embed = {
        title: boundedLiteral(eventTitle(eventType), DISCORD_EMBED_LIMITS.title, true),
        timestamp,
    }
    const description = firstScalar(object.description, object.name)
    if (description != null) {
        embed.description = boundedLiteral(description, DISCORD_EMBED_LIMITS.description, false)
    }

    const fields = snapshotFields(body, data, object, objectType, eventType, objectId, eventId, accountId, context)
    embed.fields = fitLiteralEmbedFields(embed, fields)
    output.addEmbed(embed)
}

function mapThinEvent(body: Record<string, any>, eventId: string, eventType: string, output: ProviderOutput): void {
    const timestamp = canonicalizeIso8601Timestamp(body.created)
    const context = optionalStripeId(body, 'context')
    const hasRelatedObject = Object.hasOwn(body, 'related_object') && body.related_object != null
    const relatedObject = hasRelatedObject && isRecord(body.related_object) ? body.related_object : null
    const relatedObjectId = relatedObject == null ? null : stripeId(relatedObject.id)
    const relatedObjectType =
        relatedObject == null ? null : boundedType(relatedObject.type, OBJECT_TYPE_PATTERN, MAX_OBJECT_TYPE_CHARACTERS)
    if (
        timestamp == null ||
        context === false ||
        (hasRelatedObject && (relatedObject == null || relatedObjectId == null || relatedObjectType == null))
    ) {
        output.ignore()
        return
    }

    const embed: Embed = {
        title: boundedLiteral(eventTitle(eventType), DISCORD_EMBED_LIMITS.title, true),
        timestamp,
    }
    const fields: EmbedField[] = [{ name: 'Mode', value: body.livemode ? 'Live' : 'Test', inline: true }]
    if (relatedObjectType != null && relatedObjectId != null) {
        fields.push(
            { name: 'Related object', value: humanizeStripeType(relatedObjectType), inline: true },
            { name: 'Related object ID', value: relatedObjectId, inline: true },
        )
    }
    if (context != null) {
        fields.push({ name: 'Context', value: context, inline: true })
    }
    fields.push({ name: 'Event ID', value: eventId, inline: true })
    embed.fields = fitLiteralEmbedFields(embed, fields)
    output.addEmbed(embed)
}

function snapshotFields(
    body: Record<string, any>,
    data: Record<string, any>,
    object: Record<string, any>,
    objectType: string,
    eventType: string,
    objectId: string | null,
    eventId: string,
    accountId: string | null,
    context: string | null,
): EmbedField[] {
    const fields: EmbedField[] = [{ name: 'Mode', value: body.livemode ? 'Live' : 'Test', inline: true }]

    const status = scalarText(object.status)
    if (status != null) {
        fields.push({ name: 'Status', value: humanizeEnum(status), inline: true })
    }

    const amount = firstAmount(object, eventType, objectType)
    if (amount != null) {
        fields.push({ name: amount.label, value: amount.value, inline: true })
    }

    if (accountId != null) addIdField(fields, 'Account ID', accountId)
    if (context != null) addIdField(fields, 'Context', context)
    addReferenceField(fields, 'Customer ID', object.customer)
    addReferenceField(fields, 'Subscription ID', object.subscription)
    addReferenceField(fields, 'Invoice ID', object.invoice)
    addReferenceField(fields, 'Payment intent ID', object.payment_intent)
    addReferenceField(fields, 'Charge ID', object.charge)

    const failure = firstScalar(object.failure_message, nestedScalar(object.last_payment_error, 'message'))
    if (failure != null) {
        fields.push({ name: 'Failure', value: failure, inline: false })
    }

    if (objectId != null) {
        addIdField(fields, `${humanizeStripeType(objectType)} ID`, objectId)
    }

    const changedFields = changedFieldSummary(data.previous_attributes)
    if (changedFields != null) {
        fields.push({ name: 'Changed fields', value: changedFields, inline: false })
    }
    fields.push({ name: 'Event ID', value: eventId, inline: true })
    return fields
}

function firstAmount(
    object: Record<string, any>,
    eventType: string,
    objectType: string,
): { label: string; value: string } | null {
    const currency = boundedCurrency(object.currency)
    if (currency == null) {
        return null
    }
    for (const [property, label] of amountFieldsFor(eventType, objectType)) {
        const value = formatStripeAmount(object[property], currency)
        if (value != null) {
            return { label, value }
        }
    }
    return null
}

function amountFieldsFor(eventType: string, objectType: string): readonly (readonly [string, string])[] {
    if (objectType === 'payment_intent') {
        return eventType === 'payment_intent.succeeded'
            ? PAYMENT_INTENT_SUCCEEDED_AMOUNT_FIELDS
            : PAYMENT_INTENT_AMOUNT_FIELDS
    }
    if (objectType === 'invoice') {
        return eventType === 'invoice.paid' || eventType === 'invoice.payment_succeeded'
            ? INVOICE_PAID_AMOUNT_FIELDS
            : INVOICE_OUTSTANDING_AMOUNT_FIELDS
    }
    if (objectType === 'charge') {
        return eventType === 'charge.refunded' ? CHARGE_REFUNDED_AMOUNT_FIELDS : CHARGE_AMOUNT_FIELDS
    }
    if (objectType === 'checkout.session') {
        return CHECKOUT_SESSION_AMOUNT_FIELDS
    }
    return AMOUNT_FIELDS
}

function formatStripeAmount(value: unknown, currency: string): string | null {
    if (!Number.isSafeInteger(value)) {
        return null
    }
    const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2
    return `${(Number(value) / 10 ** fractionDigits).toFixed(fractionDigits)} ${currency}`
}

function boundedCurrency(value: unknown): string | null {
    return typeof value === 'string' && /^[A-Za-z]{3}$/.test(value) ? value.toUpperCase() : null
}

function addReferenceField(fields: EmbedField[], name: string, value: unknown): void {
    const id = isRecord(value) ? stripeId(value.id) : stripeId(value)
    if (id != null) {
        addIdField(fields, name, id)
    }
}

function addIdField(fields: EmbedField[], name: string, value: string): void {
    if (!fields.some((field) => field.name === name && field.value === value)) {
        fields.push({ name, value, inline: true })
    }
}

function changedFieldSummary(value: unknown): string | null {
    if (!isRecord(value)) {
        return null
    }
    const keys = Object.keys(value)
    if (keys.length === 0) {
        return null
    }
    const labels = keys
        .slice(0, MAX_CHANGED_FIELDS)
        .map((key) =>
            truncateText(humanizeWords(key).replace(/\burl\b/gi, 'URL'), MAX_CHANGED_FIELD_LABEL_CHARACTERS, true),
        )
        .sort((left, right) => left.localeCompare(right))
    const summary = labels.join(', ')
    return keys.length <= labels.length ? summary : `${summary} (+${keys.length - labels.length} more)`
}

function nestedScalar(value: unknown, key: string): string | null {
    return isRecord(value) ? scalarText(value[key]) : null
}

function optionalStripeId(body: Record<string, any>, property: string): string | null | false {
    if (!Object.hasOwn(body, property) || body[property] == null) {
        return null
    }
    return stripeId(body[property]) ?? false
}

function stripeId(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null
    }
    const id = safeId(value, MAX_ID_CHARACTERS)
    return id != null && STRIPE_ID_PATTERN.test(id) ? id : null
}

function boundedType(value: unknown, pattern: RegExp, maxLength: number): string | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
        return null
    }
    return pattern.test(value) ? value : null
}

function stripeUnixTimestamp(value: unknown): string | null {
    if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > MAX_UNIX_TIMESTAMP_SECONDS) {
        return null
    }
    return new Date(Number(value) * 1000).toISOString()
}

function eventTitle(eventType: string): string {
    return humanizeStripeType(eventType)
}

function humanizeStripeType(value: string): string {
    const withoutVersion = value.replace(/^v\d+\./, '').replace(/[[\]]/g, '.')
    return humanizeWords(withoutVersion)
}

function humanizeEnum(value: string): string {
    return /^[A-Za-z][A-Za-z0-9_-]{0,100}$/.test(value) ? humanizeWords(value) : value
}

function boundedLiteral(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdownLiteral(value), maxLength, singleLine)
}
