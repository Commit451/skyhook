import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.docker.com/docker-hub/webhooks/
 */
class DockerHub extends BaseProvider {

    public getName(): string {
        return 'DockerHub'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0x0db7ed)
        const embed = new Embed()
        embed.title = '🐳 Repository: ' + this.body.repository.repo_name
        embed.description = `${this.body.push_data.pusher} pushed for tag: **${this.body.push_data.tag}**`
        embed.url = this.body.repository.repo_url
        this.addEmbed(embed)
    }

}

export { DockerHub }
