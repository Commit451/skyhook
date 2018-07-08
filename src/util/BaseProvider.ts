import { Request } from "express"
import { DiscordPayload } from "../model/DiscordPayload"
import { Embed } from "../model/Embed"
import { EmbedFooter } from "../model/EmbedFooter";

const camel = require('camelcase')

/**
 * Base provider, which all other providers will subclass. You can then
 * use the provided methods to format the data to Discord
 */
class BaseProvider {

    /**
     * Override this and provide the name of the provider
     */
    public static getName(): string {
        return null
    }

    public static formatType(type: string): string {
        if(type == null)
            return null
        type = type.replace(/:/, '_') // needed because of BitBucket
        return camel(type)
    }

    protected payload: DiscordPayload
    protected req: Request
    protected body: any
    // all embeds will use this color
    protected embedColor: number

    constructor() {
        this.payload = new DiscordPayload()
    }

    public async parse(req: Request): Promise<DiscordPayload> {
        this.req = req
        this.body = req.body

        let type: string = 'parseData'
        if (typeof this['getType'] !== 'undefined') {
            type = await this['getType']()
        }
        type = BaseProvider.formatType(type)

        const methodToCall: any = this[type]
        if (typeof methodToCall !== 'undefined') {
            console.log('[' + (new Date()).toUTCString() + '] Calling ' + type + '() in ' + this.constructor.name + ' provider.')
            await methodToCall()
        }

        return this.payload
    }

    protected addEmbed(embed: Embed): void {
        // TODO check to see if too many fields
        // add the footer to all embeds added
        embed.footer = new EmbedFooter("Powered by Skyhook")
        if (this.embedColor !== null) {
            embed.color = this.embedColor
        }
        if (this.payload.embeds === null) {
            this.payload.embeds = []
        }
        this.payload.embeds.push(embed)
    }

    protected setEmbedColor(color: number) {
        this.embedColor = color
    }

    protected getType(): string {
        return null
    }
}

export { BaseProvider }
