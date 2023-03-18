import { Embed } from '../model/DiscordApi.js'
import { DirectParseProvider } from '../provider/BaseProvider.js'

/**
 * https://www.appveyor.com/docs/notifications/#webhook-payload-default
 */
export class AppVeyor extends DirectParseProvider {

    public getName(): string {
        return 'AppVeyor'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0x00B3E0)
        const embed: Embed = {
            title: 'Build ' + this.body.eventData.buildVersion,
            url: this.body.eventData.buildUrl,
            description: this.body.eventData.commitMessage + '\n\n' + '**Status**: ' + this.body.eventData.status,
            author: {
                name: this.body.eventData.commitAuthor
            }
        }
        if (this.body.eventData.repositoryProvider === 'gitHub') {
            embed.author!.url = 'https://github.com/' + this.body.eventData.repositoryName + '/commit/' + this.body.eventData.commitId
        }

        if (this.body.eventData.jobs[0].artifacts.length !== 0) {
            embed.description += '\n**Artifacts**:'
            for (const artifact of this.body.eventData.jobs[0].artifacts) {
                embed.description += '\n- [' + artifact.fileName + '](' + artifact.permalink + ')'
            }
        }
        this.addEmbed(embed)
    }
}
