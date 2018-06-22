class DiscordPayload {
    constructor() {
        this.data = {};
        this.embedColor = null;
    }

    setEmbedColor(color) {
        this.embedColor = color;
    }

    setContent(content) {
        this.data.content = content;
    }

    setUser(username, avatarUrl) {
        this.data.username = username;
        this.data.avatar_url = avatarUrl;
    }

    addEmbed(data) {
        if (typeof this.data.embeds === 'undefined') {
            this.data.embeds = [];
        }

        data.footer = {
            text: "Powered by Skyhook",
            icon_url: ""
        };
        if (this.embedColor !== null) {
            data.color = this.embedColor;
        }
        this.data.embeds.push(data);
    }

    getData() {
        return this.data;
    }
}

module.exports = DiscordPayload;