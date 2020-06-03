import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.rollbar.com/docs/webhooks
 */
class Rollbar extends BaseProvider {

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0x3884CB)
        this.embed = new Embed()
    }

    public getName(): string {
        return 'Rollbar'
    }

    public getType(): string {
        return this.body.event_name
    }

    public async expRepeatItem() {
        this.embed.title = `${this.body.data.occurrence} occurrence of issue`
        this.embed.description = this.body.data.item.title
    }

    public async deploy() {
        const deploy = this.body.data.deploy
        this.embed.title = `New Deploy to ${deploy.environment}`
        this.embed.description = deploy.comment
    }

    public async itemVelocity() {
        this.embed.title = `Velocity increase of issue`
        this.embed.description = this.body.data.item.title
    }

    public async newItem() {
        this.embed.title = `Velocity increase of issue`
        this.embed.description = this.body.data.item.title
    }

    public async occurrence() {
        this.embed.title = `New issue`
        this.embed.description = this.body.data.item.title
    }

    public async reactivatedItem() {
        this.embed.title = `Issue reactivated`
        this.embed.description = this.body.data.item.title
    }

    public async reopenedItem() {
        this.embed.title = `Issue reopened`
        this.embed.description = this.body.data.item.title
    }

    public async resolvedItem() {
        this.embed.title = `Issue resolved`
        this.embed.description = this.body.data.item.title
    }

    public postParse() {
        this.addEmbed(this.embed)
    }
}

export { Rollbar }