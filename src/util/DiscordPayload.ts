class DiscordPayload {

    private data: any
    private embedColor: string

    constructor() {
        this.data = {}
        this.embedColor = null
    }

    public setEmbedColor(color: string) {
        this.embedColor = color
    }

    public setContent(content: string) {
        this.data.content = content
    }

    public setUser(username: string, avatarUrl: string) {
        this.data.username = username
        this.data.avatar_url = avatarUrl
    }

    public addEmbed(data: any) {
        if (typeof this.data.embeds === 'undefined') {
            this.data.embeds = []
        }

        data.footer = {
            icon_url: "",
            text: "Powered by Skyhook",
        }
        if (this.embedColor !== null) {
            data.color = this.embedColor
        }
        this.data.embeds.push(data)
    }

    public getData() {
        return this.data
    }
}
export { DiscordPayload }
