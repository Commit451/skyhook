import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DirectParseProvider } from './BaseProvider.ts'

const MAX_EMBED_CHARACTERS = 6000
const MAX_TITLE_CHARACTERS = 256
const MAX_DESCRIPTION_CHARACTERS = 4096
const MAX_AUTHOR_NAME_CHARACTERS = 256
const MAX_FIELD_NAME_CHARACTERS = 256
const MAX_FIELD_VALUE_CHARACTERS = 1024
const MAX_FIELDS = 25
const MAX_URL_CHARACTERS = 2048
const FOOTER_TEXT = 'Powered by skyhookapi.com'
const ISO_8601_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/
const DATA_CHANGE_ACTIONS = new Set(['create', 'update', 'remove'])
const IGNORED_UPDATED_FIELDS = new Set(['prioritySortOrder', 'sortOrder', 'updatedAt'])
const PRIORITY_LABELS: Record<number, string> = {
    0: 'No priority',
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low',
}

/**
 * Converts Linear data-change and convenience webhooks into bounded Discord embeds.
 *
 * Linear signs each delivery with a webhook-specific secret. Skyhook's generated URL
 * does not carry that secret, so this provider cannot verify the signature and treats
 * all webhook content as untrusted display data.
 *
 * @see https://linear.app/developers/webhooks
 */
export class Linear extends DirectParseProvider {
    constructor() {
        super()
        this.setEmbedColor(0x5e6ad2)
        this.payload.username = 'Linear'
        this.payload.allowed_mentions = { parse: [] }
    }

    public getName(): string {
        return 'Linear'
    }

    public getPath(): string {
        return 'linear'
    }

    public async parseData(): Promise<void> {
        if (!isRecord(this.body)) {
            this.nullifyPayload()
            return
        }

        const action = boundedToken(this.body.action, 64)
        const type = boundedToken(this.body.type, 100)
        const timestamp = canonicalizeTimestamp(scalarText(this.body.createdAt))
        if (
            action == null ||
            type == null ||
            timestamp == null ||
            !Number.isSafeInteger(this.body.webhookTimestamp) ||
            this.body.webhookTimestamp <= 0 ||
            !isBoundedString(this.body.webhookId, 128)
        ) {
            this.nullifyPayload()
            return
        }

        const data = isRecord(this.body.data)
            ? this.body.data
            : isRecord(this.body.issueData)
              ? this.body.issueData
              : {}
        if (DATA_CHANGE_ACTIONS.has(action) && !isRecord(this.body.data)) {
            this.nullifyPayload()
            return
        }

        const headerEvent = getHeader(this.headers, 'linear-event')
        if (headerEvent != null && headerEvent !== type) {
            this.nullifyPayload()
            return
        }

        const embed: Embed = {
            title: escapeAndTruncate(this.createTitle(type, action, data), MAX_TITLE_CHARACTERS, true),
            timestamp,
        }

        const description = firstScalar(data.body, data.description, data.content)
        if (description != null) {
            embed.description = escapeAndTruncate(description, MAX_DESCRIPTION_CHARACTERS, false)
        }

        const url = trustedLinearUrl(this.body.url)
        if (url != null) {
            embed.url = url
        }

        const actor = isRecord(this.body.actor) ? this.body.actor : null
        const actorName = scalarText(actor?.name)
        if (actorName != null) {
            embed.author = {
                name: escapeAndTruncate(actorName, MAX_AUTHOR_NAME_CHARACTERS, true),
            }
            const actorUrl = trustedLinearUrl(actor?.url)
            if (actorUrl != null) {
                embed.author.url = actorUrl
            }
        }

        embed.fields = fitFields(embed, this.createFields(data))
        this.addEmbed(embed)
    }

    private createTitle(type: string, action: string, data: Record<string, any>): string {
        const resource = resourceTypeLabel(type)
        const actionLabel = actionPhrase(action, type)
        const identifier = scalarText(data.identifier)
        const name = scalarText(data.name)
        const title = scalarText(data.title)
        const subject = identifier != null && title != null ? `${identifier} — ${title}` : (identifier ?? name ?? title)

        return `${resource} ${actionLabel}${subject == null ? '' : `: ${subject}`}`
    }

    private createFields(data: Record<string, any>): EmbedField[] {
        const fields: EmbedField[] = []

        addField(fields, 'State', nestedName(data.state) ?? scalarText(data.stateName))
        addField(fields, 'Assignee', nestedName(data.assignee))
        addField(fields, 'Priority', priorityLabel(data.priority))
        addField(fields, 'Team', nestedName(data.team))
        addField(fields, 'Project', nestedName(data.project))
        addField(fields, 'Cycle', nestedName(data.cycle))
        addField(fields, 'Customer', nestedName(data.customer))
        addField(fields, 'Labels', listNames(data.labels), false)
        addField(fields, 'OAuth client ID', scalarText(this.body.oauthClientId))

        if (isRecord(this.body.updatedFrom)) {
            const changedFields = [
                ...new Set(
                    Object.keys(this.body.updatedFrom)
                        .filter((key) => !IGNORED_UPDATED_FIELDS.has(key))
                        .map((key) => changedFieldLabel(key)),
                ),
            ]
            if (changedFields.length > 0) {
                fields.push({ name: 'Updated fields', value: changedFields.join(', '), inline: false })
            }
        }

        return fields
    }
}

function addField(fields: EmbedField[], name: string, value: string | null, inline = true): void {
    if (value != null) {
        fields.push({ name, value, inline })
    }
}

function fitFields(embed: Embed, candidates: EmbedField[]): EmbedField[] {
    let usedCharacters =
        (embed.title?.length ?? 0) +
        (embed.description?.length ?? 0) +
        (embed.author?.name.length ?? 0) +
        FOOTER_TEXT.length
    const fields: EmbedField[] = []

    for (const candidate of candidates.slice(0, MAX_FIELDS)) {
        const name = escapeAndTruncate(candidate.name, MAX_FIELD_NAME_CHARACTERS, true)
        const remainingCharacters = MAX_EMBED_CHARACTERS - usedCharacters - name.length
        if (remainingCharacters <= 0) {
            break
        }
        const value = escapeAndTruncate(
            candidate.value,
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

function resourceTypeLabel(type: string): string {
    if (type === 'OAuthApp') {
        return 'OAuth app'
    }
    if (type === 'IssueSLA') {
        return 'Issue SLA'
    }
    return humanizeToken(type)
}

function actionPhrase(action: string, type: string): string {
    if (type === 'IssueSLA') {
        const slaPhrases: Record<string, string> = {
            breached: 'breached',
            highRisk: 'at high risk',
            set: 'set',
        }
        return slaPhrases[action] ?? humanizeToken(action).toLowerCase()
    }

    const phrases: Record<string, string> = {
        create: 'created',
        remove: 'removed',
        revoked: 'revoked',
        update: 'updated',
    }
    return phrases[action] ?? humanizeToken(action).toLowerCase()
}

function changedFieldLabel(key: string): string {
    const withoutIdSuffix = key.replace(/Ids?$/, '')
    return humanizeToken(withoutIdSuffix)
}

function humanizeToken(value: string): string {
    const words = cleanText(value, true)
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .replace(/[._-]+/g, ' ')
        .toLowerCase()
    return words.length === 0 ? '' : words.charAt(0).toUpperCase() + words.slice(1)
}

function nestedName(value: unknown): string | null {
    return isRecord(value) ? scalarText(value.name ?? value.title) : scalarText(value)
}

function listNames(value: unknown): string | null {
    if (!Array.isArray(value)) {
        return null
    }
    const names = value.map((item) => nestedName(item)).filter((item): item is string => item != null)
    return names.length === 0 ? null : names.join(', ')
}

function priorityLabel(value: unknown): string | null {
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
        return PRIORITY_LABELS[value] ?? String(value)
    }
    return scalarText(value)
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

function getHeader(headers: unknown, name: string): string | null {
    if (headers instanceof Headers) {
        return scalarText(headers.get(name))
    }
    if (!isRecord(headers)) {
        return null
    }
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === name) {
            return scalarText(value)
        }
    }
    return null
}

function trustedLinearUrl(value: unknown): string | null {
    if (!isBoundedString(value, MAX_URL_CHARACTERS)) {
        return null
    }
    try {
        const url = new URL(value)
        if (url.protocol !== 'https:' || (url.hostname !== 'linear.app' && url.hostname !== 'www.linear.app')) {
            return null
        }
        const normalizedUrl = url.href
        return normalizedUrl.length <= MAX_URL_CHARACTERS ? normalizedUrl : null
    } catch {
        return null
    }
}

function boundedToken(value: unknown, maxLength: number): string | null {
    return isBoundedString(value, maxLength) && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value) ? value : null
}

function isBoundedString(value: unknown, maxLength: number): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength
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

function escapeAndTruncate(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdown(value), maxLength, singleLine)
}

function escapeDiscordMarkdown(value: string): string {
    return value.replace(/([\\`*_{}[\]()<>#+!|~])/g, '\\$1')
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

function canonicalizeTimestamp(value: string | null): string | null {
    if (value == null) {
        return null
    }
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

function isRecord(value: unknown): value is Record<string, any> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
}
