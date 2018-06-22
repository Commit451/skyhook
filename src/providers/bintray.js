// bintray.js
// https://bintray.com/docs/api/#_webhooks
// ========
const BaseProvider = require('../util/BaseProvider');
const MarkdownUtil = require('../util/MarkdownUtil');

class Bintray extends BaseProvider {

    static getName() {
        return 'Bintray';
    }

    async parseData() {
        this.payload.setEmbedColor(0x43a047);
        const embed = {
            title: this.body.package + ' v' + this.body.version + ' Released',
            timestamp: this.body.released
        };
        if (this.body.release_notes != null && this.body.release_notes) {
            embed.fields = [
                {
                    name: 'Release Notes',
                    value: MarkdownUtil._formatMarkdown(this.body.release_notes),
                    inline: false
                }
            ];
        }
        this.payload.addEmbed(embed);
    }

}


module.exports = Bintray;