// circleci.js
// https://circleci.com/docs/1.0/configuration/#notify
// ========
const BaseProvider = require('../util/BaseProvider');

class CircleCi extends BaseProvider {
    static getName() {
        return 'CircleCi';
    }

    async parseData(req) {
        this.payload.setEmbedColor(0x343433);
        this.payload.addEmbed({
            title: `Build #${this.body.payload.build_num}`,
            url: this.body.payload.build_url,
            author: {
                name: `${this.body.payload.reponame}:${this.body.payload.branch}`,
                icon_url: `https://github.com/${this.body.payload.committer_name}.png`
            },
            description: `[\`${this.body.payload.vcs_revision.slice(0,7)}\`](${this.body.payload.compare}) : ${this.body.payload.subject} - ${this.body.payload.committer_name}\n\`Outcome\`: ${this.body.payload.outcome}`
        });
    }
}

module.exports = CircleCi;