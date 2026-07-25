import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { escapeDiscordMarkdownLiteral, truncateText } from './DiscordText.ts'

export const DISCORD_MESSAGE_LIMITS = {
    content: 2000,
    embeds: 10,
    embedCharacters: 6000,
} as const

export const DISCORD_EMBED_LIMITS = {
    title: 256,
    description: 4096,
    fieldName: 256,
    fieldValue: 1024,
    authorName: 256,
    footerText: 2048,
    fields: 25,
} as const

export const SKYHOOK_FOOTER = {
    text: 'Powered by skyhookapi.com',
    icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
} as const

export const SKYHOOK_FOOTER_TEXT = SKYHOOK_FOOTER.text

export interface FitLiteralEmbedFieldsOptions {
    footerText?: string
}

export function fitLiteralEmbedFields(
    embed: Embed,
    candidates: readonly EmbedField[],
    { footerText = SKYHOOK_FOOTER_TEXT }: FitLiteralEmbedFieldsOptions = {},
): EmbedField[] {
    let usedCharacters =
        (embed.title?.length ?? 0) +
        (embed.description?.length ?? 0) +
        (embed.author?.name.length ?? 0) +
        footerText.length
    const fields: EmbedField[] = []

    for (const candidate of candidates.slice(0, DISCORD_EMBED_LIMITS.fields)) {
        const name = truncateText(escapeDiscordMarkdownLiteral(candidate.name), DISCORD_EMBED_LIMITS.fieldName, true)
        const remainingCharacters = DISCORD_MESSAGE_LIMITS.embedCharacters - usedCharacters - name.length
        if (remainingCharacters <= 0) {
            break
        }
        const value = truncateText(
            escapeDiscordMarkdownLiteral(candidate.value),
            Math.min(DISCORD_EMBED_LIMITS.fieldValue, remainingCharacters),
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
