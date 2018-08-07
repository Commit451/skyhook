import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://www.pingdom.com/resources/webhooks
 */
class Pingdom extends BaseProvider {

    public getName() {
        return 'Pingdom'
    }

    public async parseData() {
        if (this.body.current_state !== this.body.previous_state) {
            const embed = new Embed()
            embed.title = 'State changed'
            embed.description = 'State change from ' + this.body.previous_state + ' to ' + this.body.current_state
            this.setEmbedColor((this.body.current_state === 'UP') ? 0x4caf50 : 0xd32f2f)
            this.addEmbed(embed)
        }
    }
}

export { Pingdom }
