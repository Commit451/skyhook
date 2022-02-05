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
        this.addEmbed({
            title: this.query.monitorFriendlyName,
            url: this.query.monitorURL,
            description: this.query.alertDetails
        })
    }
}
