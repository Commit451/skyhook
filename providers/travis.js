// travis.js
// https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
// ========
const BaseProvider = require('../util/BaseProvider');

class TravisCi extends BaseProvider {
    static getName() {
        return 'Travis';
    }

    async parseData() {
        this.payload.setEmbedColor(0xC7B398);
        this.payload.addEmbed({
            title: "Build #" + this.body.number,
            url: this.body.build_url,
            author: {
                name: this.body.repository.name
            },
            description: "**Status**: " + this.body.status_message
        });
    }
}

module.exports = TravisCi;

