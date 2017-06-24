// circleci.js
// https://circleci.com/docs/1.0/configuration/#notify
// ========
const BaseProvider = require('../util/BaseProvider');

class CircleCi extends BaseProvider {
    static getName() {
        return 'CircleCi';
    }

    async parseData(req) {
        this.payload.setEmbedColor(0x000000);
        this.payload.addEmbed({
            title: "Build #" + this.body.payload.build_num,
            url: this.body.payload.build_url,
            author: {
                name: this.body.payload.reponame
            },
            description: "**Outcome**: " + this.body.payload.outcome
        });
    }
}

module.exports = CircleCi;