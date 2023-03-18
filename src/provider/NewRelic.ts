import { DirectParseProvider } from '../provider/BaseProvider.js'

/**
 * https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload
 */
export class NewRelic extends DirectParseProvider {

    public getName(): string {
        return 'New Relic'
    }

    public getPath(): string {
        return 'newrelic'
    }

    public async parseData(): Promise<void> {
        this.addEmbed({
            title: `${this.body.condition_name} ${this.body.current_state}`,
            url: this.body.incident_url,
            description: this.body.details
        })
    }
}
