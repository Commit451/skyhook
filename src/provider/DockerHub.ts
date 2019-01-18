import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.docker.com/docker-hub/webhooks/
 */
class DockerHub extends BaseProvider {
    public getName() {
        return 'DockerHub'
    }

    public async parseData() {
        this.setEmbedColor(0xFFFFFF)
        const embed = new Embed()
        embed.title = this.body.repository.repo_name
        embed.description = 'New push for tag: ' + this.body.push_data.tag
        embed.url = this.body.repository.repo_url
        this.addEmbed(embed)
    }
}

export { DockerHub }
