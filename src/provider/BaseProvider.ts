import type { DiscordPayload, Embed } from '../model/DiscordApi.ts'
import { type Logger, logger } from '../util/logger.ts'

function camelCase(s: string): string {
    const parts = s.split(/[._\-\s]+/).filter((p) => p.length > 0)
    if (parts.length === 0) return ''
    const [first, ...rest] = parts
    return (
        first.charAt(0).toLowerCase() +
        first.slice(1) +
        rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
    )
}

/**
 * Base provider, which all other providers will subclass. You can then
 * use the provided methods to format the data to Discord
 */
export abstract class BaseProvider {
    protected payload: DiscordPayload
    protected logger: Logger = logger
    protected headers: any
    protected body: any
    protected query: any
    // all embeds will use this color
    protected embedColor: number | null

    constructor() {
        this.payload = {}
        this.embedColor = null
    }

    /**
     * Override this and provide the name of the provider
     */
    public abstract getName(): string

    /**
     * By default, the path is always just the same as the name, all lower case. Override if that is not the case
     */
    public getPath(): string {
        return this.getName().toLowerCase()
    }

    /**
     * Parse the request and respond with a DiscordPayload
     *
     * @param body the request body
     * @param headers the request headers
     * @param query the query
     */
    public async parse(body: any, headers: any = null, query: any = null): Promise<DiscordPayload | null> {
        this.body = body
        this.headers = headers
        this.query = query
        this.preParse()
        this.parseImpl()
        this.postParse()

        return this.payload
    }

    /**
     * Nullify the payload. This will effectively cancel the operation and sent nothing to discord.
     */
    protected nullifyPayload(): void {
        this.payload = null!
    }

    /**
     * Open method to do certain things pre parse.
     */
    protected preParse(): void {
        // Default
    }

    /**
     * Parse implementation. The parse strategy is up to the implementation.
     */
    protected abstract parseImpl(): Promise<void>

    /**
     * Open method to do certain things post parse and before the payload is returned.
     */
    protected postParse(): void {
        // Default
    }

    protected addEmbed(embed: Embed): void {
        // TODO check to see if too many fields
        // add the footer to all embeds added
        embed.footer = {
            text: 'Powered by skyhookapi.com',
            icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
        }
        if (this.embedColor != null) {
            embed.color = this.embedColor
        }
        if (this.payload.embeds == null) {
            this.payload.embeds = []
        }
        this.payload.embeds.push(embed)
    }

    protected setEmbedColor(color: number): void {
        this.embedColor = color
    }
}

/**
 * BaseProvider implementation that uses a direct parse strategy.
 * Subclasses should implement parse logic in the parseData method.
 */
export abstract class DirectParseProvider extends BaseProvider {
    public abstract parseData(): Promise<void>

    protected async parseImpl(): Promise<void> {
        await this.parseData()
    }
}

/**
 * BaseProvider implementation that uses a type based parse strategy.
 * Sublasses must implement a getType method. This method will look at
 * the payload data and determine its type. A function matching the returned
 * type name will be executed. If none function matching the type name
 * is found, nothing will be executed.
 */
export abstract class TypeParseProvider extends BaseProvider {
    public abstract getType(): string | null

    public abstract knownTypes(): string[]

    /**
     * Formats the type passed to make it work as a method reference. This means removing underscores
     * and camel casing.
     *
     * @param type the event type
     */
    public static formatType(type: string | null): string | null {
        if (type == null) {
            return null
        }
        type = type.replace(/:/g, '_') // needed because of BitBucket
        return camelCase(type)
    }

    protected async parseImpl(): Promise<void> {
        const type = TypeParseProvider.formatType(this.getType())
        if (type != null) {
            if (this.knownTypes().includes(type)) {
                const method: () => Promise<void> | null = (this as any)[type]
                if (method != null && typeof method === 'function') {
                    this.logger.info(`Calling ${type}() in ${this.constructor.name} provider.`)
                    await method.bind(this)()
                    return
                }
            }
        }
        // If we didn't succeed, dont send anything.
        this.nullifyPayload()
    }
}
