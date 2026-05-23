import { DirectParseProvider } from '../provider/BaseProvider.ts'

/**
 * https://docs.docker.com/docker-hub/webhooks/
 */
export class DockerHub extends DirectParseProvider {
    public getName(): string {
        return 'DockerHub'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0x0db7ed)
        this.addEmbed({
            title: '🐳 Repository: ' + this.body.repository.repo_name,
            description: `${this.body.push_data.pusher} pushed for tag: **${this.body.push_data.tag}**`,
            url: this.body.repository.repo_url,
        })
    }
}
