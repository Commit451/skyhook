import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload
 */
class NewRelic extends BaseProvider {

    public getName() {
        return 'New Relic'
    }

    public getPath() {
        return 'newrelic'
    }

    public async parseData() {
        const details = this.body.details
        const state = this.body.current_state
        const embed = new Embed()
        embed.title = `${this.body.condition_name} ${state}`
        embed.url = this.body.incident_url
        embed.description = details
        this.addEmbed(embed)
    }
}

export { NewRelic }
