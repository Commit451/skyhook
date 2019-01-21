import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://www.appveyor.com/docs/notifications/#webhook-payload-default
 */
class AppVeyor extends BaseProvider {

    public getName() {
        return 'AppVeyor'
    }

    public async parseData() {
        this.setEmbedColor(0x00B3E0)
        const embed = new Embed()
        embed.title = 'Build ' + this.body.eventData.buildVersion
        embed.url = this.body.eventData.buildUrl
        embed.description = '**Status**: ' + this.body.eventData.status
        const author = new EmbedAuthor()
        author.name = this.body.eventData.commitAuthor
        if (this.body.eventData.repositoryProvider == "gitHub")
        {
            author.url = "https://github.com/" + this.body.eventData.repositoryName + "/commit/" + this.body.eventData.commitId
        }
        embed.author = author
        this.addEmbed(embed)
    }
}

export { AppVeyor }
