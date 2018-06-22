// dockerhub.js
// https://docs.docker.com/docker-hub/webhooks/
// ========
const BaseProvider = require('../util/BaseProvider');

class DockerHub extends BaseProvider {
    static getName() {
        return 'DockerHub';
    }

    async parseData() {
        this.payload.setEmbedColor(0xFFFFFF);
        this.payload.addEmbed({
            title: "New push for tag: " + this.body.push_data.tag,
            url: this.body.repository.repo_url,
            author: {
                name: this.body.push_data.pusher
            }
        });
    }
}

module.exports = DockerHub;