import { BaseProvider } from "../util/BaseProvider"

/**
 * https://docs.docker.com/docker-hub/webhooks/
 */
class DockerHub extends BaseProvider {
    public static getName() {
        return 'DockerHub'
    }

    public async parseData() {
        this.payload.setEmbedColor(0xFFFFFF)
        this.payload.addEmbed({
            title: "New push for tag: " + this.body.push_data.tag,
            url: this.body.repository.repo_url,
            author: {
                name: this.body.push_data.pusher,
            },
        })
    }
}
export { DockerHub }
