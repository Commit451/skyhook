// pingdom.js
// https://www.pingdom.com/resources/webhooks
// ========
const BaseProvider = require('../util/BaseProvider');

class Pingdom extends BaseProvider {
    static getName() {
        return "Pingdom";
    }

    async parseData() {
        if (this.body.current_state !== this.body.previous_state) {
            this.payload.setEmbedColor((this.body.current_state === "UP") ? 0x4caf50 : 0xd32f2f);
            this.payload.addEmbed({
                title: "State changed",
                description: "State change from " + this.body.previous_state + " to " + this.body.current_state
            });
        }
    }
}

module.exports = Pingdom;