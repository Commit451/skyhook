function DiscordPayload() {
    this.data = {};
    this.embedColor = null;

    this.setEmbedColor = function (color) {
        this.embedColor = color;
    };

    this.setContent = function (content) {
        this.data.content = content;
    };

    this.setUser = function (user, avatarUrl) {
        this.data.username = user;
        this.data.avatar_url = avatarUrl;
    };

    this.addEmbed = function (data) {
        if (typeof this.data.embeds === 'undefined') {
            this.data.embeds = [];
        }
        
        if (this.embedColor !== null) {
            data.color = this.embedColor;
        }
        this.data.embeds.push(data);
    };

    this.getData = function () {
        return this.data;
    };
}

module.exports = DiscordPayload;
