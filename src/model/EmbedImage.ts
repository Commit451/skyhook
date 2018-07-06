/**
 * https://discordapp.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
class EmbedImage {
    public url: string
    public height: number
    public width: number
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

export { EmbedImage }
