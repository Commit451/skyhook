import { DISCORD_EMBED_LIMITS, DISCORD_MESSAGE_LIMITS } from './DiscordEmbed.ts'
import { isRecord } from './WebhookValue.ts'

export type DiscordPayloadValidationCode =
    | 'payload-type'
    | 'content-type'
    | 'content-length'
    | 'embeds-type'
    | 'embed-count'
    | 'embed-type'
    | 'embed-title-type'
    | 'embed-title-length'
    | 'embed-description-type'
    | 'embed-description-length'
    | 'embed-author-type'
    | 'embed-author-name-type'
    | 'embed-author-name-length'
    | 'embed-footer-type'
    | 'embed-footer-text-type'
    | 'embed-footer-text-length'
    | 'embed-fields-type'
    | 'embed-field-count'
    | 'embed-field-type'
    | 'embed-field-name-type'
    | 'embed-field-name-length'
    | 'embed-field-value-type'
    | 'embed-field-value-length'
    | 'embed-total-characters'

export interface DiscordPayloadValidationIssue {
    code: DiscordPayloadValidationCode
    path: string
    actual?: number
    limit?: number
}

export function validateDiscordPayload(payload: unknown): DiscordPayloadValidationIssue[] {
    const issues: DiscordPayloadValidationIssue[] = []
    if (!isRecord(payload)) {
        return [{ code: 'payload-type', path: '$' }]
    }

    if (hasOwn(payload, 'content')) {
        validateText(
            payload.content,
            'content',
            DISCORD_MESSAGE_LIMITS.content,
            'content-type',
            'content-length',
            issues,
        )
    }

    if (!hasOwn(payload, 'embeds')) {
        return issues
    }
    if (!Array.isArray(payload.embeds)) {
        issues.push({ code: 'embeds-type', path: 'embeds' })
        return issues
    }
    if (payload.embeds.length > DISCORD_MESSAGE_LIMITS.embeds) {
        issues.push({
            code: 'embed-count',
            path: 'embeds',
            actual: payload.embeds.length,
            limit: DISCORD_MESSAGE_LIMITS.embeds,
        })
    }

    let totalEmbedCharacters = 0
    for (const [embedIndex, embed] of payload.embeds.entries()) {
        const embedPath = `embeds[${embedIndex}]`
        if (!isRecord(embed)) {
            issues.push({ code: 'embed-type', path: embedPath })
            continue
        }

        if (hasOwn(embed, 'title')) {
            totalEmbedCharacters += validateText(
                embed.title,
                `${embedPath}.title`,
                DISCORD_EMBED_LIMITS.title,
                'embed-title-type',
                'embed-title-length',
                issues,
            )
        }
        if (hasOwn(embed, 'description')) {
            totalEmbedCharacters += validateText(
                embed.description,
                `${embedPath}.description`,
                DISCORD_EMBED_LIMITS.description,
                'embed-description-type',
                'embed-description-length',
                issues,
            )
        }
        if (hasOwn(embed, 'author')) {
            totalEmbedCharacters += validateNestedText(
                embed.author,
                'name',
                `${embedPath}.author`,
                DISCORD_EMBED_LIMITS.authorName,
                'embed-author-type',
                'embed-author-name-type',
                'embed-author-name-length',
                issues,
            )
        }
        if (hasOwn(embed, 'footer')) {
            totalEmbedCharacters += validateNestedText(
                embed.footer,
                'text',
                `${embedPath}.footer`,
                DISCORD_EMBED_LIMITS.footerText,
                'embed-footer-type',
                'embed-footer-text-type',
                'embed-footer-text-length',
                issues,
            )
        }
        if (hasOwn(embed, 'fields')) {
            totalEmbedCharacters += validateFields(embed.fields, embedPath, issues)
        }
    }

    if (totalEmbedCharacters > DISCORD_MESSAGE_LIMITS.embedCharacters) {
        issues.push({
            code: 'embed-total-characters',
            path: 'embeds',
            actual: totalEmbedCharacters,
            limit: DISCORD_MESSAGE_LIMITS.embedCharacters,
        })
    }

    return issues
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
    return Object.hasOwn(value, key)
}

function validateText(
    value: unknown,
    path: string,
    limit: number,
    typeCode: DiscordPayloadValidationCode,
    lengthCode: DiscordPayloadValidationCode,
    issues: DiscordPayloadValidationIssue[],
): number {
    if (typeof value !== 'string') {
        issues.push({ code: typeCode, path })
        return 0
    }
    if (value.length > limit) {
        issues.push({ code: lengthCode, path, actual: value.length, limit })
    }
    return value.length
}

function validateNestedText(
    value: unknown,
    key: string,
    path: string,
    limit: number,
    recordTypeCode: DiscordPayloadValidationCode,
    textTypeCode: DiscordPayloadValidationCode,
    lengthCode: DiscordPayloadValidationCode,
    issues: DiscordPayloadValidationIssue[],
): number {
    if (!isRecord(value)) {
        issues.push({ code: recordTypeCode, path })
        return 0
    }
    return validateText(value[key], `${path}.${key}`, limit, textTypeCode, lengthCode, issues)
}

function validateFields(value: unknown, embedPath: string, issues: DiscordPayloadValidationIssue[]): number {
    const fieldsPath = `${embedPath}.fields`
    if (!Array.isArray(value)) {
        issues.push({ code: 'embed-fields-type', path: fieldsPath })
        return 0
    }
    if (value.length > DISCORD_EMBED_LIMITS.fields) {
        issues.push({
            code: 'embed-field-count',
            path: fieldsPath,
            actual: value.length,
            limit: DISCORD_EMBED_LIMITS.fields,
        })
    }

    let characters = 0
    for (const [fieldIndex, field] of value.entries()) {
        const fieldPath = `${fieldsPath}[${fieldIndex}]`
        if (!isRecord(field)) {
            issues.push({ code: 'embed-field-type', path: fieldPath })
            continue
        }
        characters += validateText(
            field.name,
            `${fieldPath}.name`,
            DISCORD_EMBED_LIMITS.fieldName,
            'embed-field-name-type',
            'embed-field-name-length',
            issues,
        )
        characters += validateText(
            field.value,
            `${fieldPath}.value`,
            DISCORD_EMBED_LIMITS.fieldValue,
            'embed-field-value-type',
            'embed-field-value-length',
            issues,
        )
    }
    return characters
}
