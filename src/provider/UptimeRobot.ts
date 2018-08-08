import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/
 * Example:
 * http://www.domain.com/?monitorID=95987545252&monitorURL=http://test.com&monitorFriendlyName=TestWebsite&alertType=*0&alertDetails=ConnectionTimeout&monitorAlertContacts=457;2;john@doe.com
 */
class UptimeRobot extends BaseProvider {

    public getName() {
        return 'Uptime Robot'
    }

    public getPath() {
        return 'uptimerobot'
    }

    public async parseData() {
        const embed = new Embed()
        embed.title = this.query.monitorFriendlyName
        embed.url = this.query.monitorURL
        embed.description = this.query.alertDetails
        this.addEmbed(embed)
    }
}

export { UptimeRobot }
