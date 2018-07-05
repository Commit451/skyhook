/**
 * https://discordapp.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
class EmbedFooter {
    public text: string
    // tslint:disable-next-line:variable-name
    private icon_url: string
    // tslint:disable-next-line:variable-name
    private proxy_icon_url: string

    constructor(text: string) {
        this.text = text
    }

    get iconUrl(): string {
        return this.icon_url
    }

    set iconUrl(value: string) {
        this.icon_url = value
    }

    get proxyIconUrl(): string {
        return this.proxy_icon_url
    }

    set proxyIconUrl(value: string) {
        this.proxy_icon_url = value
    }
}

export { EmbedFooter }
