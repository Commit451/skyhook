import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://www.pingdom.com/resources/webhooks
 */
export class Pingdom extends DirectParseProvider {

    public getName(): string {
        return 'Pingdom'
    }

    public async parseData(): Promise<void> {
        if (this.body.current_state !== this.body.previous_state) {
            this.setEmbedColor((this.body.current_state === 'UP') ? 0x4caf50 : 0xd32f2f)
            this.addEmbed({
                title: this.body.check_name + ' - State changed',
                description: 'State change from ' + this.body.previous_state + ' to ' + this.body.current_state
            })
        }
    }
}
