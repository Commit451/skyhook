import { Embed } from "../model/Embed"
import { EmbedFooter } from "../model/EmbedFooter"

/**
 * https://discordapp.com/developers/docs/resources/webhook#execute-webhook
 */
class DiscordPayload {

    private content: any
    private username: string
    // tslint:disable-next-line:variable-name
    private avatar_url: string
    private tts: boolean
    private embeds: Embed[]
    // all embeds will use this color
    private embedColor: number

    constructor() {
        this.embedColor = null
    }

    public setEmbedColor(color: number) {
        this.embedColor = color
    }

    public setContent(content: string) {
        this.content = content
    }

    public setUser(username: string, avatarUrl: string) {
        this.username = username
        this.avatar_url = avatarUrl
    }

    public addEmbed(data: Embed) {
        if (this.embeds === null) {
            this.embeds = []
        }

        // add the footer to all embeds added
        data.footer = new EmbedFooter("Powered by Skyhook")
        if (this.embedColor !== null) {
            data.color = this.embedColor
        }
        this.embeds.push(data)
    }
}
export { DiscordPayload }
