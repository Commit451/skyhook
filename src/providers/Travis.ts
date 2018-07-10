import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../util/BaseProvider'

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
class Travis extends BaseProvider {

    public getName() {
        return 'Travis'
    }

    public async parseData() {
        this.setEmbedColor(0xC7B398)
        const embed = new Embed()
        embed.title = 'Build #' + this.body.number
        embed.url = this.body.build_url
        embed.description = '**Status**: ' + this.body.status_message
        const author = new EmbedAuthor()
        author.name = this.body.repository.name
        embed.author = author
        this.addEmbed(embed)
    }
}

export { Travis }
