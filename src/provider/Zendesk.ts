import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DISCORD_EMBED_LIMITS, fitLiteralEmbedFields } from '../util/DiscordEmbed.ts'
import { cleanText, escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../util/DiscordText.ts'
import { canonicalizeIso8601Timestamp, safeId as extractSafeId, isRecord, scalarText } from '../util/WebhookValue.ts'
import { defineProvider, type ProviderOutput } from './Provider.ts'

const EVENT_TYPE_PREFIX = 'zen:event-type'
const SUBJECT_DOMAIN_ALIASES: Record<string, readonly string[]> = {
    messaging_ticket: ['ticket'],
    omnichannel_config: ['account'],
}
/**
 * Converts Zendesk event-subscription webhooks into bounded Discord embeds.
 * Trigger and automation webhooks are intentionally excluded because Zendesk lets
 * administrators define an arbitrary payload for those connection methods.
 *
 * Zendesk signs deliveries with a webhook-specific secret that skyhook does not
 * possess, so every body field is treated as untrusted display data.
 *
 * @see https://developer.zendesk.com/api-reference/webhooks/webhooks-api/webhooks/
 * @see https://developer.zendesk.com/api-reference/webhooks/event-types/webhook-event-types/
 */
export const Zendesk = defineProvider({
    path: 'zendesk',
    name: 'Zendesk',
    example: { body: 'zendesk/zendesk.json' },
    defaults: { embedColor: 0x03363d },
    map({ body }, output) {
        new ZendeskMapper(body).map(output)
    },
})

class ZendeskMapper {
    private readonly body: Record<string, any>

    public constructor(body: Record<string, any>) {
        this.body = body
    }

    public map(output: ProviderOutput): void {
        if (!isRecord(this.body) || !isRecord(this.body.detail) || !isRecord(this.body.event)) {
            output.ignore()
            return
        }

        const timestamp = validateEnvelope(this.body)
        if (timestamp == null) {
            output.ignore()
            return
        }

        const eventType = isBoundedString(this.body.type, 200) ? this.body.type : null
        const hasKnownDelimiter =
            eventType?.startsWith(`${EVENT_TYPE_PREFIX}:`) === true ||
            eventType?.startsWith(`${EVENT_TYPE_PREFIX}/`) === true
        if (eventType == null || !hasKnownDelimiter) {
            output.ignore()
            return
        }

        const eventName = eventType.slice(EVENT_TYPE_PREFIX.length + 1)
        const separator = eventName.indexOf('.')
        if (separator <= 0 || separator === eventName.length - 1) {
            output.ignore()
            return
        }

        const resource = eventName.slice(0, separator)
        const action = eventName.slice(separator + 1)
        if (!/^[a-z0-9_]+$/.test(resource) || !/^[a-z0-9_]+$/.test(action)) {
            output.ignore()
            return
        }
        const subjectDomain = this.body.subject.split(':', 3)[1]
        if (subjectDomain !== resource && !SUBJECT_DOMAIN_ALIASES[resource]?.includes(subjectDomain)) {
            output.ignore()
            return
        }

        const detail = this.body.detail
        const event = this.body.event
        const resourceName = humanizeWords(resource)
        const actionName = humanizeWords(action).toLowerCase()
        const label = this.getResourceLabel(detail, event)
        const title = escapeAndTruncate(
            `${resourceName} ${actionName}${label == null ? '' : `: ${label}`}`,
            DISCORD_EMBED_LIMITS.title,
            true,
        )
        const embed: Embed = { title }

        const description = this.getDescription(action, detail, event)
        if (description != null) {
            embed.description = escapeAndTruncate(description, DISCORD_EMBED_LIMITS.description, false)
        }

        const comment = isRecord(event.comment) ? event.comment : null
        const actor = isRecord(event.actor) ? event.actor : null
        const authorName =
            (comment != null && isRecord(comment.author) ? scalarText(comment.author.name) : null) ??
            scalarText(actor?.name)
        if (authorName != null) {
            embed.author = {
                name: escapeAndTruncate(authorName, DISCORD_EMBED_LIMITS.authorName, true),
            }
        }

        embed.timestamp = timestamp

        const fields = [...this.createEventFields(event), ...this.createResourceFields(resource, detail)]
        embed.fields = fitLiteralEmbedFields(embed, fields)

        output.addEmbed(embed)
    }

    private getResourceLabel(detail: Record<string, any>, event: Record<string, any>): string | null {
        return scalarText(detail.subject ?? detail.name ?? event.title)
    }

    private getDescription(action: string, detail: Record<string, any>, event: Record<string, any>): string | null {
        const comment = isRecord(event.comment) ? event.comment : null
        const commentBody = comment == null ? null : scalarText(comment.body)
        if (commentBody != null) {
            return commentBody
        }

        const message = isRecord(event.message) ? event.message : null
        const messageBody = message == null ? null : scalarText(message.body)
        if (messageBody != null) {
            return messageBody
        }

        const satisfactionScore = isRecord(event.satisfaction_score) ? event.satisfaction_score : null
        const satisfactionComment = satisfactionScore == null ? null : scalarText(satisfactionScore.comment)
        if (satisfactionComment != null) {
            return satisfactionComment
        }

        if (action === 'created' || action === 'published') {
            return scalarText(detail.description)
        }
        return null
    }

    private createEventFields(event: Record<string, any>): EmbedField[] {
        const fields: EmbedField[] = []
        const fieldConfiguration = isRecord(event.custom_field)
            ? event.custom_field
            : isRecord(event.field)
              ? event.field
              : null
        const hasDirectChange = event.previous != null || event.current != null
        const previous = displayValue(
            event.previous ??
                event.previous_value ??
                event.previous_state ??
                event.previous_reason ??
                event.previous_unified_state,
        )
        const current = displayValue(
            event.current ?? event.current_value ?? event.new_state ?? event.reason ?? event.new_unified_state,
        )
        if (previous != null || current != null) {
            const previousLabel = !hasDirectChange && previous != null ? humanizeWords(previous) : previous
            const currentLabel = !hasDirectChange && current != null ? humanizeWords(current) : current
            fields.push({
                name: scalarText(fieldConfiguration?.title) ?? 'Change',
                value: `${previousLabel ?? 'None'} → ${currentLabel ?? 'None'}`,
                inline: false,
            })
        }

        addEnumField(fields, 'Channel', event.channel)

        addListField(fields, 'Tags added', event.tags_added)
        addListField(fields, 'Tags removed', event.tags_removed)
        addListField(fields, 'Users added', event.users_added)
        addListField(fields, 'Users removed', event.users_removed)
        if (isRecord(event.added)) {
            addListField(fields, 'Tags added', event.added.tags)
        }
        if (isRecord(event.removed)) {
            addListField(fields, 'Tags removed', event.removed.tags)
        }

        const comment = isRecord(event.comment) ? event.comment : null
        if (comment != null && typeof comment.is_public === 'boolean') {
            fields.push({
                name: 'Visibility',
                value: comment.is_public ? 'Public reply' : 'Internal note',
                inline: true,
            })
        }

        const satisfactionScore = isRecord(event.satisfaction_score) ? event.satisfaction_score : null
        const score = satisfactionScore == null ? null : scalarText(satisfactionScore.score)
        if (score != null) {
            fields.push({ name: 'Satisfaction', value: humanizeWords(score), inline: true })
        }

        const targetTicketId = safeId(event.target_ticket_id)
        if (targetTicketId != null) {
            fields.push({ name: 'Target ticket ID', value: targetTicketId, inline: true })
        }

        return fields
    }

    private createResourceFields(resource: string, detail: Record<string, any>): EmbedField[] {
        const fields: EmbedField[] = []
        const resourceId = safeId(detail.id ?? (resource === 'agent' ? detail.agent_id : null))
        if (resourceId != null) {
            fields.push({ name: `${humanizeWords(resource)} ID`, value: resourceId, inline: true })
        }

        if (resource === 'ticket' || resource === 'messaging_ticket') {
            addEnumField(fields, 'Status', detail.status)
            addEnumField(fields, 'Priority', detail.priority)
            addEnumField(fields, 'Type', detail.type)
            const via = isRecord(detail.via) ? detail.via : null
            addEnumField(fields, 'Channel', via?.channel)
        } else if (resource === 'omnichannel_config') {
            addIdField(fields, 'Account ID', detail.account_id)
        } else if (resource === 'organization') {
            addIdField(fields, 'Group ID', detail.group_id)
        } else if (resource === 'user') {
            addEnumField(fields, 'Role', detail.role)
            addIdField(fields, 'Default group ID', detail.default_group_id)
            addIdField(fields, 'Organization ID', detail.organization_id)
        } else if (resource === 'article') {
            addIdField(fields, 'Brand ID', detail.brand_id)
            addIdField(fields, 'User ID', detail.user_id)
        }

        return fields
    }
}

function addEnumField(fields: EmbedField[], name: string, value: unknown): void {
    const text = scalarText(value)
    if (text != null) {
        fields.push({ name, value: humanizeWords(text), inline: true })
    }
}

function addIdField(fields: EmbedField[], name: string, value: unknown): void {
    const id = safeId(value)
    if (id != null) {
        fields.push({ name, value: id, inline: true })
    }
}

function addListField(fields: EmbedField[], name: string, value: unknown): void {
    if (!Array.isArray(value)) {
        return
    }
    const items = value
        .map((item) => scalarText(item))
        .filter((item): item is string => item != null)
        .map((item) => humanizeListItem(item))
    if (items.length > 0) {
        fields.push({ name, value: items.join(', '), inline: false })
    }
}

function displayValue(value: unknown): string | null {
    if (isRecord(value)) {
        return scalarText(value.value ?? value.name ?? value.title ?? value.id)
    }
    if (typeof value === 'boolean') {
        return value ? 'True' : 'False'
    }
    const text = scalarText(value)
    if (text == null) {
        return null
    }
    return shouldHumanizeValue(text) ? humanizeWords(text) : text
}

function shouldHumanizeValue(value: string): boolean {
    return /^[A-Z0-9_-]+$/.test(value) || (/^[a-z0-9_-]+$/.test(value) && /[_-]/.test(value))
}

function humanizeListItem(value: string): string {
    return cleanText(value, true)
        .replace(/[._-]+/g, ' ')
        .toLowerCase()
}

function safeId(value: unknown): string | null {
    return extractSafeId(value, 128)
}

function escapeAndTruncate(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdownLiteral(value), maxLength, singleLine)
}

function validateEnvelope(body: Record<string, any>): string | null {
    if (!Number.isSafeInteger(body.account_id) || body.account_id <= 0) {
        return null
    }
    if (!isBoundedString(body.id, 128)) {
        return null
    }
    if (!isBoundedString(body.subject, 256) || !/^zen:[a-z0-9_]+:[^:]+$/.test(body.subject)) {
        return null
    }
    if (!isBoundedString(body.zendesk_event_version, 32) || !/^\d{4}-\d{2}-\d{2}$/.test(body.zendesk_event_version)) {
        return null
    }
    if (!isBoundedString(body.time, 64)) {
        return null
    }
    return canonicalizeIso8601Timestamp(body.time)
}

function isBoundedString(value: unknown, maxLength: number): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength
}
