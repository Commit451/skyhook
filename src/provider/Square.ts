import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DISCORD_EMBED_LIMITS, fitLiteralEmbedFields } from '../util/DiscordEmbed.ts'
import { cleanText, escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../util/DiscordText.ts'
import { canonicalizeIso8601Timestamp, isRecord } from '../util/WebhookValue.ts'
import { DirectParseProvider } from './BaseProvider.ts'

const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$/
const DATA_TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/

/**
 * Converts Square's common webhook envelope into a bounded Discord embed.
 *
 * Square signs the notification URL and exact raw request body with a subscription-specific
 * signature key. Skyhook does not possess that key and parses the request before provider
 * dispatch, so this provider cannot verify x-square-hmacsha256-signature. All values are
 * therefore treated as untrusted display data.
 *
 * @see https://developer.squareup.com/docs/webhooks/overview
 * @see https://developer.squareup.com/docs/webhooks/step2subscribe#format-of-an-event-notification
 */
export class Square extends DirectParseProvider {
    public constructor() {
        super()
        this.setEmbedColor(0x006aff)
        this.payload.username = 'Square'
        this.payload.allowed_mentions = { parse: [] }
    }

    public getName(): string {
        return 'Square'
    }

    public getPath(): string {
        return 'square'
    }

    public async parseData(): Promise<void> {
        if (!isRecord(this.body)) {
            this.nullifyPayload()
            return
        }

        const eventType = boundedEventType(this.body.type)
        const eventId = boundedText(this.body.event_id, 128)
        const merchantId = boundedText(this.body.merchant_id, 128)
        const timestamp = canonicalizeIso8601Timestamp(this.body.created_at)
        const data = isRecord(this.body.data) ? this.body.data : null
        const dataType = boundedDataType(data?.type)
        const hasDataId = data != null && Object.hasOwn(data, 'id')
        const dataId = hasDataId ? boundedText(data.id, 512) : null
        if (
            eventType == null ||
            eventId == null ||
            merchantId == null ||
            timestamp == null ||
            data == null ||
            dataType == null ||
            (hasDataId && dataId == null)
        ) {
            this.nullifyPayload()
            return
        }

        const object = findAffectedObject(data, dataType)
        const title = createTitle(eventType, object, dataType)
        const embed: Embed = {
            title: truncateText(escapeDiscordMarkdownLiteral(title), DISCORD_EMBED_LIMITS.title, true),
            timestamp,
        }
        embed.fields = fitLiteralEmbedFields(embed, createFields(this.body, object, dataType, dataId))
        this.addEmbed(embed)
    }
}

function createTitle(eventType: string, object: Record<string, any> | null, dataType: string): string {
    const parts = eventType.split('.')
    const action = parts.pop()!
    const resource = humanizeSquareWords(parts.join(' '))
    const actionLabel = humanizeSquareWords(action).toLowerCase()
    const subject = object == null ? null : objectLabel(object, dataType)
    return `${resource} ${actionLabel}${subject == null ? '' : `: ${subject}`}`
}

function createFields(
    envelope: Record<string, any>,
    object: Record<string, any> | null,
    dataType: string,
    dataId: string | null,
): EmbedField[] {
    const fields: EmbedField[] = []
    const status = object == null ? null : firstScalar(object.status, object.state)
    if (status != null) {
        fields.push({ name: 'Status', value: humanizeStatus(status), inline: true })
    }

    const amount = object == null ? null : firstMoney(object)
    if (amount != null) {
        fields.push({ name: 'Amount', value: amount, inline: true })
    }

    addIdentifierField(fields, 'Order ID', object?.order_id)
    addIdentifierField(fields, 'Customer ID', object?.customer_id)
    addIdentifierField(fields, 'Location ID', envelope.location_id ?? object?.location_id)

    const objectIdName = `${humanizeSquareWords(dataType)} ID`
    if (dataId != null && !fields.some(({ name, value }) => name === objectIdName && value === dataId)) {
        fields.push({ name: objectIdName, value: dataId, inline: true })
    }
    return fields
}

function addIdentifierField(fields: EmbedField[], name: string, value: unknown): void {
    const identifier = boundedText(value, 512)
    if (identifier != null) {
        fields.push({ name, value: identifier, inline: true })
    }
}

function findAffectedObject(data: Record<string, any>, dataType: string): Record<string, any> | null {
    if (!isRecord(data.object)) {
        return null
    }
    if (isRecord(data.object[dataType])) {
        return data.object[dataType]
    }

    const recordValues = Object.values(data.object).filter(isRecord)
    return recordValues.length === 1 ? recordValues[0] : null
}

function objectLabel(object: Record<string, any>, dataType: string): string | null {
    if (dataType === 'customer') {
        const customerName = [scalarText(object.given_name), scalarText(object.family_name)].filter(Boolean).join(' ')
        if (customerName.length > 0) {
            return customerName
        }
    }
    return firstScalar(object.name, object.title, object.reference_id)
}

function firstMoney(object: Record<string, any>): string | null {
    for (const value of [object.amount_money, object.total_money, object.total_amount_money, object.approved_money]) {
        const formatted = formatMoney(value)
        if (formatted != null) {
            return formatted
        }
    }
    return null
}

function formatMoney(value: unknown): string | null {
    if (!isRecord(value) || !Number.isSafeInteger(value.amount) || !/^[A-Z]{3}$/.test(value.currency)) {
        return null
    }
    try {
        const fractionDigits =
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: value.currency,
            }).resolvedOptions().maximumFractionDigits ?? 2
        return `${(value.amount / 10 ** fractionDigits).toFixed(fractionDigits)} ${value.currency}`
    } catch {
        return null
    }
}

function boundedEventType(value: unknown): string | null {
    const type = boundedText(value, 200)
    return type != null && EVENT_TYPE_PATTERN.test(type) ? type : null
}

function boundedDataType(value: unknown): string | null {
    const type = boundedText(value, 100)
    return type != null && DATA_TYPE_PATTERN.test(type) ? type : null
}

function boundedText(value: unknown, maxLength: number): string | null {
    if (typeof value !== 'string') {
        return null
    }
    const text = cleanText(value, true)
    return text.length > 0 && text.length <= maxLength ? text : null
}

function firstScalar(...values: unknown[]): string | null {
    for (const value of values) {
        const text = scalarText(value)
        if (text != null) {
            return text
        }
    }
    return null
}

function scalarText(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return null
    }
    if (
        typeof value === 'number' &&
        (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))
    ) {
        return null
    }
    const text = cleanText(String(value), false)
    return text.length > 0 ? text : null
}

function humanizeSquareWords(value: string): string {
    return humanizeWords(value).replace(/^Oauth\b/, 'OAuth')
}

function humanizeStatus(value: string): string {
    return /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(value) ? humanizeSquareWords(value) : value
}
