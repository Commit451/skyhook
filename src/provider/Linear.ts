import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DISCORD_EMBED_LIMITS, fitLiteralEmbedFields } from '../util/DiscordEmbed.ts'
import { cleanText, escapeDiscordMarkdownLiteral, truncateText } from '../util/DiscordText.ts'
import {
    canonicalizeIso8601Timestamp,
    firstScalar,
    isRecord,
    scalarText,
    trustedHttpsUrl,
} from '../util/WebhookValue.ts'
import { defineProvider } from './Provider.ts'

const MAX_URL_CHARACTERS = 2048
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
export const Linear = defineProvider({
    path: 'linear',
    name: 'Linear',
    example: {
        body: 'linear/linear.json',
        headers: 'linear/linear.headers.json',
    },
    defaults: {
        username: 'Linear',
        embedColor: 0x5e6ad2,
    },
    map({ body, headers }, output) {
        const action = boundedToken(body.action, 64)
        const type = boundedToken(body.type, 100)
        const timestamp = canonicalizeIso8601Timestamp(body.createdAt)
        if (
            action == null ||
            type == null ||
            timestamp == null ||
            !Number.isSafeInteger(body.webhookTimestamp) ||
            body.webhookTimestamp <= 0 ||
            !isBoundedString(body.webhookId, 128)
        ) {
            output.ignore()
            return
        }

        const data = isRecord(body.data) ? body.data : isRecord(body.issueData) ? body.issueData : {}
        if (DATA_CHANGE_ACTIONS.has(action) && !isRecord(body.data)) {
            output.ignore()
            return
        }

        const headerEvent = getHeader(headers, 'linear-event')
        if (headerEvent != null && headerEvent !== type) {
            output.ignore()
            return
        }

        const embed: Embed = {
            title: escapeAndTruncate(createTitle(type, action, data), DISCORD_EMBED_LIMITS.title, true),
            timestamp,
        }

        const description = firstScalar(data.body, data.description, data.content)
        if (description != null) {
            embed.description = escapeAndTruncate(description, DISCORD_EMBED_LIMITS.description, false)
        }

        const url = trustedLinearUrl(body.url)
        if (url != null) {
            embed.url = url
        }

        const actor = isRecord(body.actor) ? body.actor : null
        const actorName = scalarText(actor?.name)
        if (actorName != null) {
            embed.author = {
                name: escapeAndTruncate(actorName, DISCORD_EMBED_LIMITS.authorName, true),
            }
            const actorUrl = trustedLinearUrl(actor?.url)
            if (actorUrl != null) {
                embed.author.url = actorUrl
            }
        }

        embed.fields = fitLiteralEmbedFields(embed, createFields(body, data))
        output.addEmbed(embed)
    },
})

function createTitle(type: string, action: string, data: Record<string, any>): string {
    const resource = resourceTypeLabel(type)
    const actionLabel = actionPhrase(action, type)
    const identifier = scalarText(data.identifier)
    const name = scalarText(data.name)
    const title = scalarText(data.title)
    const subject = identifier != null && title != null ? `${identifier} — ${title}` : (identifier ?? name ?? title)

    return `${resource} ${actionLabel}${subject == null ? '' : `: ${subject}`}`
}

function createFields(body: Record<string, any>, data: Record<string, any>): EmbedField[] {
    const fields: EmbedField[] = []

    addField(fields, 'State', nestedName(data.state) ?? scalarText(data.stateName))
    addField(fields, 'Assignee', nestedName(data.assignee))
    addField(fields, 'Priority', priorityLabel(data.priority))
    addField(fields, 'Team', nestedName(data.team))
    addField(fields, 'Project', nestedName(data.project))
    addField(fields, 'Cycle', nestedName(data.cycle))
    addField(fields, 'Customer', nestedName(data.customer))
    addField(fields, 'Labels', listNames(data.labels), false)
    addField(fields, 'OAuth client ID', scalarText(body.oauthClientId))

    if (isRecord(body.updatedFrom)) {
        const changedFields = [
            ...new Set(
                Object.keys(body.updatedFrom)
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

function addField(fields: EmbedField[], name: string, value: string | null, inline = true): void {
    if (value != null) {
        fields.push({ name, value, inline })
    }
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
    return trustedHttpsUrl(value, {
        allowedHosts: ['linear.app', 'www.linear.app'],
        maxLength: MAX_URL_CHARACTERS,
    })
}

function boundedToken(value: unknown, maxLength: number): string | null {
    return isBoundedString(value, maxLength) && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value) ? value : null
}

function isBoundedString(value: unknown, maxLength: number): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength
}

function escapeAndTruncate(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdownLiteral(value), maxLength, singleLine)
}
