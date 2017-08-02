// codacy.js
// https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications
// ========
const BaseProvider = require('../util/BaseProvider');

class Codacy extends BaseProvider {
    static getName() {
        return 'Codacy';
    }

    async parseData() {
        this.payload.setEmbedColor(0x242c33);
        this.payload.addEmbed({
            title: 'New Commit',
            url: this.body.commit.data.urls.delta,
            fields: [
                {
                    name: 'Fixed Issues',
                    value: this.body.commit.results.fixed_count,
                    inline: true
                },
                {
                    name: 'New Issues',
                    value: this.body.commit.results.new_count,
                    inline: true
                }
            ]
        });
    }
}

module.exports = Codacy;