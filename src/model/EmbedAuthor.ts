/**
 * https://discordapp.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
class EmbedAuthor {
    public name: string
    public url: string
    // tslint:disable-next-line:variable-name
    private icon_url: string
    // tslint:disable-next-line:variable-name
    private proxy_icon_url: string

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

export { EmbedAuthor }
