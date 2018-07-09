import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../util/BaseProvider'

/**
 * https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook
 */
class Heroku extends BaseProvider {

    public getName() {
        return 'Heroku'
    }

    public async parseData() {
        this.setEmbedColor(0xC9C3E6)
        const embed = new Embed()
        embed.title = 'Deployed App ' + this.body.app
        embed.url = this.body.url
        const author = new EmbedAuthor()
        author.name = this.body.user
        embed.author = author
        this.addEmbed(embed)
    }
}

module.exports = Heroku
