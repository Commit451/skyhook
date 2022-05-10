import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/
 * Example:
 * http://www.domain.com/?monitorID=95987545252&monitorURL=http://test.com&monitorFriendlyName=TestWebsite&alertType=*0&alertDetails=ConnectionTimeout&monitorAlertContacts=457;2;john@doe.com
 */
export class UptimeRobot extends DirectParseProvider {

    public getName(): string {
        return 'Uptime Robot'
    }

    public getPath(): string {
        return 'uptimerobot'
    }

    public async parseData(): Promise<void> {
        let title = this.query.monitorFriendlyName
        if (title == null) {
            title = this.body.monitorFriendlyName
        }
        let url = this.query.monitorURL
        if (url == null) {
            url = this.body.monitorURL
        }
        let description = this.query.alertDetails
        if (description == null) {
            description = this.body.alertDetails
        }
        this.addEmbed({
            title: title,
            url: url,
            description: description,
        })
    }
}
