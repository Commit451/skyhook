import { DirectParseProvider } from '../provider/BaseProvider'
import gravatar from 'gravatar'

/**
 * https://devcenter.heroku.com/articles/app-webhooks
 */
export class Heroku extends DirectParseProvider {

    public getName(): string {
        return 'Heroku'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0xC9C3E6)
        const action: string = this.actionAsPastTense(this.body.action)
        const type: string = this.typeAsReadable(this.body.webhook_metadata.event.include)
        const authorName: string = this.body.actor.email
        let name = this.body.data.name
        if (name == null) {
            name = this.body.data.app.name
        }

        this.addEmbed({
            title: `${authorName} ${action} ${type}. App: ${name}`,
            url: this.body.data.web_url,
            author: {
                name: authorName,
                icon_url: gravatar.url(this.body.actor.email, { s: '100', r: 'x', d: 'retro' }, true)
            },
        })
    }

    private actionAsPastTense(action: string): string {
        switch (action) {
            case 'create':
                return 'created'
            case 'destroy':
                return 'destroyed'
            case 'update':
                return 'updated'
        }
        return 'unknown'
    }

    private typeAsReadable(type: string): string {
        return type.split('api:')[1]
    }
}
