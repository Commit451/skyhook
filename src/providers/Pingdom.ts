import { BaseProvider } from "../util/BaseProvider"

/**
 * https://www.pingdom.com/resources/webhooks
 */
class Pingdom extends BaseProvider {
    public static getName() {
        return "Pingdom"
    }

    public async parseData() {
        if (this.body.current_state !== this.body.previous_state) {
            this.payload.setEmbedColor((this.body.current_state === "UP") ? 0x4caf50 : 0xd32f2f)
            this.payload.addEmbed({
                title: "State changed",
                description: "State change from " + this.body.previous_state + " to " + this.body.current_state,
            })
        }
    }
}

export { Pingdom }
