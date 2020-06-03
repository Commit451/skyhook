/**
 * https://discordapp.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
class EmbedFooter {
    public text: string
    public icon_url: string
    public proxy_icon_url: string

    constructor(text: string) {
        this.text = text
    }
}

export { EmbedFooter }
