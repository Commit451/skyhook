import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://plugins.jenkins.io/notification
 */
class Jenkins extends BaseProvider {

    private static capitalize(str: string) {
        const tmp = str.toLowerCase()
        return tmp.charAt(0).toUpperCase() + tmp.slice(1)
    }

    public getName() {
        return 'Jenkins-CI'
    }

    public getPath() {
        return 'jenkins'
    }

    public async parseData() {
        this.setEmbedColor(0xF0D6B7)
        const phase = this.body.build.phase
        const embed = new Embed()
        embed.title = 'Project ' + this.body.name
        embed.url = this.body.build.full_url
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

export { Jenkins }
