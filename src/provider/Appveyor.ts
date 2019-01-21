import { Embed } from '../model/Embed'
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
        embed.description = '**Status**: ' + this.body.eventData.status
        embed.title = 'Build #' + this.body.eventData.buildNumber
        embed.url = this.body.eventData.buildUrl
        this.addEmbed(embed)
    }
}

export { AppVeyor }
