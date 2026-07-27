import type { DiscordPayload, Embed, EmbedAuthor } from '../../model/DiscordApi.ts'
import {
    DISCORD_EMBED_LIMITS,
    DISCORD_MESSAGE_LIMITS,
    SKYHOOK_FOOTER,
    SKYHOOK_FOOTER_TEXT,
} from '../../util/DiscordEmbed.ts'
import { truncateText } from '../../util/DiscordText.ts'
import { canonicalizeIso8601Timestamp, isRecord } from '../../util/WebhookValue.ts'
import type { ProviderDefaults } from './ProviderTypes.ts'

const DISCORD_WEBHOOK_USERNAME_LIMIT = 80
const DISCORD_URL_LIMIT = 2048

export function finalizeDiscordPayload(payload: DiscordPayload, defaults: ProviderDefaults = {}): DiscordPayload {
    const result: DiscordPayload = {}

    if (typeof payload.content === 'string') {
        const content = truncateText(payload.content, DISCORD_MESSAGE_LIMITS.content, false)
        if (content.length > 0) result.content = content
    }

    const username = payload.username ?? defaults.username
    if (typeof username === 'string') {
        const bounded = truncateText(username, DISCORD_WEBHOOK_USERNAME_LIMIT, true)
        if (bounded.length > 0) result.username = bounded
    }

    const avatarUrl = normalizeWebUrl(payload.avatar_url ?? defaults.avatarUrl)
    if (avatarUrl != null) result.avatar_url = avatarUrl

    if (typeof payload.tts === 'boolean') result.tts = payload.tts
    result.allowed_mentions = { parse: [] }

    if (Array.isArray(payload.embeds) && payload.embeds.length > 0) {
        const embeds = finalizeEmbeds(payload.embeds, defaults.embedColor)
        if (embeds.length > 0) result.embeds = embeds
    }

    return result
}

function finalizeEmbeds(embeds: readonly Embed[], defaultColor: number | undefined): Embed[] {
    const candidates = embeds.filter(isRecord).slice(0, DISCORD_MESSAGE_LIMITS.embeds) as Embed[]
    let remainingCharacters = DISCORD_MESSAGE_LIMITS.embedCharacters
    const finalized: Embed[] = []

    for (let index = 0; index < candidates.length; index += 1) {
        const remainingFooterCount = candidates.length - index
        const reservedFooterCharacters = remainingFooterCount * SKYHOOK_FOOTER_TEXT.length
        if (remainingCharacters < reservedFooterCharacters) break

        const input = candidates[index]
        let availableCharacters = remainingCharacters - reservedFooterCharacters
        const embed: Embed = { footer: { ...SKYHOOK_FOOTER } }

        const color = validDiscordColor(input.color)
            ? input.color
            : validDiscordColor(defaultColor)
              ? defaultColor
              : undefined
        if (color != null) embed.color = color

        const url = normalizeWebUrl(input.url)
        if (url != null) embed.url = url

        const timestamp = canonicalizeIso8601Timestamp(input.timestamp)
        if (timestamp != null) embed.timestamp = timestamp

        const imageUrl = normalizeWebUrl(input.image?.url)
        if (imageUrl != null) embed.image = { url: imageUrl }

        const thumbnailUrl = normalizeWebUrl(input.thumbnail?.url)
        if (thumbnailUrl != null) embed.thumbnail = { url: thumbnailUrl }

        const title = boundedEmbedText(input.title, DISCORD_EMBED_LIMITS.title, true, availableCharacters)
        if (title != null) {
            embed.title = title
            availableCharacters -= title.length
        }

        const description = boundedEmbedText(
            input.description,
            DISCORD_EMBED_LIMITS.description,
            false,
            availableCharacters,
        )
        if (description != null) {
            embed.description = description
            availableCharacters -= description.length
        }

        const author = finalizeAuthor(input.author, availableCharacters)
        if (author != null) {
            embed.author = author
            availableCharacters -= author.name.length
        }

        if (Array.isArray(input.fields)) {
            const fields = []
            for (const candidate of input.fields.slice(0, DISCORD_EMBED_LIMITS.fields)) {
                if (!isRecord(candidate)) continue
                const name = boundedEmbedText(candidate.name, DISCORD_EMBED_LIMITS.fieldName, true, availableCharacters)
                if (name == null) continue
                const value = boundedEmbedText(
                    candidate.value,
                    DISCORD_EMBED_LIMITS.fieldValue,
                    false,
                    availableCharacters - name.length,
                )
                if (value == null) continue
                fields.push({
                    name,
                    value,
                    ...(typeof candidate.inline === 'boolean' ? { inline: candidate.inline } : {}),
                })
                availableCharacters -= name.length + value.length
            }
            embed.fields = fields
        }

        const usedNonFooterCharacters = remainingCharacters - reservedFooterCharacters - availableCharacters
        remainingCharacters -= usedNonFooterCharacters + SKYHOOK_FOOTER_TEXT.length
        finalized.push(embed)
    }

    return finalized
}

function finalizeAuthor(value: unknown, availableCharacters: number): EmbedAuthor | null {
    if (!isRecord(value)) return null
    const name = boundedEmbedText(value.name, DISCORD_EMBED_LIMITS.authorName, true, availableCharacters)
    if (name == null) return null

    const author: EmbedAuthor = { name }
    const url = normalizeWebUrl(value.url)
    if (url != null) author.url = url
    const iconUrl = normalizeWebUrl(value.icon_url)
    if (iconUrl != null) author.icon_url = iconUrl
    return author
}

function boundedEmbedText(
    value: unknown,
    propertyLimit: number,
    singleLine: boolean,
    availableCharacters: number,
): string | null {
    if (typeof value !== 'string' || availableCharacters <= 0) return null
    const bounded = truncateText(value, Math.min(propertyLimit, availableCharacters), singleLine)
    return bounded.length === 0 ? null : bounded
}

function validDiscordColor(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 0xffffff
}

function normalizeWebUrl(value: unknown): string | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > DISCORD_URL_LIMIT) return null
    try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
    } catch {
        return null
    }
}
