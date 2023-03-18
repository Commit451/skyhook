import { Embed } from '../model/DiscordApi.js'
import { DirectParseProvider } from '../provider/BaseProvider.js'

/**
 * https://plugins.jenkins.io/notification
 */
export class Jenkins extends DirectParseProvider {

    private static capitalize(str: string): string {
        const tmp = str.toLowerCase()
        return tmp.charAt(0).toUpperCase() + tmp.slice(1)
    }

    public getName(): string {
        return 'Jenkins-CI'
    }

    public getPath(): string {
        return 'jenkins'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0xF0D6B7)
        const phase = this.body.build.phase
        const embed: Embed = {
            title: 'Project ' + this.body.name,
            url: this.body.build.full_url
        }
        switch (phase) {
            case 'STARTED':
                embed.description = 'Started build #' + this.body.build.number
                break
            case 'COMPLETED':
            case 'FINALIZED':
                embed.description = Jenkins.capitalize(phase) + ' build #' + this.body.build.number + ' with status: ' + this.body.build.status
                break
        }
        this.addEmbed(embed)
    }
}
