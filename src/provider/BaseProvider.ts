import camel from 'camelcase'
import winston from 'winston'
import { DiscordPayload } from '../model/DiscordPayload'
import { Embed } from '../model/Embed'
import { EmbedFooter } from '../model/EmbedFooter'
import { LoggerUtil } from '../util/LoggerUtil'

/**
 * Base provider, which all other providers will subclass. You can then
 * use the provided methods to format the data to Discord
 */
class BaseProvider {

    public static formatType(type: string): string {
        if (type == null) {
            return null
        }
        type = type.replace(/:/, '_') // needed because of BitBucket
        return camel(type)
    }

    protected payload: DiscordPayload
    protected logger: winston.Logger
    protected headers: any
    protected body: any
    protected query: any
    // all embeds will use this color
    protected embedColor: number

    constructor() {
        this.payload = new DiscordPayload()
        this.logger = LoggerUtil.logger()
    }

    /**
     * Override this and provide the name of the provider
     */
    public getName(): string {
        return null
    }

    /**
     * Right now, the path is always just the same as the name, all lower case. Override if that is not the case
     */
    public getPath(): string {
        return this.getName().toLowerCase()
    }

    public async parse(body: any, headers: any = null, query: any = null): Promise<DiscordPayload> {
        this.body = body
        this.headers = headers
        this.query = query
        let type: string = 'parseData'
        if (typeof this['getType'] !== 'undefined') {
            type = await this['getType']()
        }
        type = BaseProvider.formatType(type)

        if (typeof this[type] !== 'undefined') {
            this.logger.info(`Calling ${type}() in ${this.constructor.name} provider.`)
            await this[type]()
        }

        return this.payload
    }

    protected addEmbed(embed: Embed): void {
        // TODO check to see if too many fields
        // add the footer to all embeds added
        embed.footer = new EmbedFooter('Powered by Skyhook')
        if (this.embedColor != null) {
            embed.color = this.embedColor
        }
        if (this.payload.embeds == null) {
            this.payload.embeds = []
        }
        this.payload.embeds.push(embed)
    }

    protected setEmbedColor(color: number) {
        this.embedColor = color
    }
}

export { BaseProvider }
