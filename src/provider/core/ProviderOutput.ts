import type { DiscordPayload, Embed } from '../../model/DiscordApi.ts'
import { type Logger, logger } from '../../util/logger.ts'
import { finalizeDiscordPayload } from './DiscordPayloadFinalizer.ts'
import type { ProviderDefaults } from './ProviderTypes.ts'

export class ProviderOutput {
    public readonly payload: DiscordPayload = {}
    public readonly logger: Logger
    private readonly defaults: ProviderDefaults
    private currentEmbedColor: number | undefined
    private ignored = false

    public constructor(defaults: ProviderDefaults = {}, outputLogger: Logger = logger) {
        this.defaults = defaults
        this.logger = outputLogger
        this.currentEmbedColor = defaults.embedColor
    }

    public addEmbed(embed: Embed): void {
        if (this.ignored) return
        if (this.payload.embeds == null) this.payload.embeds = []
        this.payload.embeds.push({
            ...embed,
            color: embed.color ?? this.currentEmbedColor,
        })
    }

    public setEmbedColor(color: number): void {
        this.currentEmbedColor = color
    }

    public ignore(): void {
        this.ignored = true
    }

    public finish(): DiscordPayload | null {
        if (this.ignored) return null
        const payload = finalizeDiscordPayload(this.payload, this.defaults)
        if (!hasMessage(payload)) {
            throw new Error(
                'Provider produced no Discord message content. Call output.ignore() for unsupported events.',
            )
        }
        return payload
    }
}

function hasMessage(payload: DiscordPayload): boolean {
    if (typeof payload.content === 'string' && payload.content.length > 0) return true
    return (
        payload.embeds?.some(
            (embed) =>
                embed.title != null ||
                embed.description != null ||
                embed.author != null ||
                (embed.fields?.length ?? 0) > 0 ||
                embed.image != null ||
                embed.thumbnail != null,
        ) ?? false
    )
}
