// appveyor.js
// https://www.appveyor.com/docs/notifications/#webhook-payload-default
// ========
const BaseProvider = require('../util/BaseProvider');

class AppVeyor extends BaseProvider {
    static getName() {
        return 'AppVeyor';
    }

    async parseData() {
        this.payload.setEmbedColor(0xFFFFFF);
        this.payload.addEmbed({
            title: "Build #" + this.body.eventData.buildNumber,
            url: this.body.eventData.buildUrl,
            author: {
                name: this.body.eventData.projectName
            },
            description: "**Status**: " + this.body.eventData.status
        });
    }
}

module.exports = AppVeyor;