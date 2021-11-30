import { Embed, EmbedField, EmbedAuthor } from '../model/DiscordApi'
import { TypeParseProvder } from './BaseProvider'

export class Prometheus extends TypeParseProvder {
    private embed: Embed
    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = {}
    }

    public preParse(): void {
        this.headers = ['x-skyhook-event']
        // Prometheus does not have a type, so we set our own.
        this.headers['x-skyhook-event'] = 'fire'
    }

    public getName(): string {
        return 'Prometheus'
    }

    public getType(): string | null {
        // Prometheus does not have a type, so we set our own.
        return this.headers['x-skyhook-event']
    }

    public knownTypes(): string[] {
        return ['fire']
    }

    /**
     * There is no event type for this provider. Creating a single
     * method to handle all events.
     */
    public async fire(): Promise<void> {
        // Set Embed Author
        this.embed.author = this.extractAuthor()

        // Set Embed Title
        this.embed.title = this.body.groupLabels?.alertname

        this.embed.url = this.body.externalURL

        // Set Embed Fields
        this.embed.fields = this.extractAlertDescriptions()

        this.addEmbed(this.embed)
    }

    private extractAuthor(): EmbedAuthor {
        return {
            name: 'Prometheus Alert',
            icon_url: 'https://avatars.githubusercontent.com/u/3380462?s=200&v=4',
        }
    }

    private extractAlertDescriptions(): EmbedField[] {
        const fieldArray: EmbedField[] = []

        // As per https://discord.com/developers/docs/resources/channel#embed-limits-limits
        // Embed fields are limited to 25 fields.

        if (this.body.alerts) {
            for (let i = 0; i < Math.min(this.body.alerts.length, 25); i++) {
                // Get current Alert
                const alert = this.body.alerts[i]

                // Push alert to fieldArray
                fieldArray.push({
                    name: alert.labels.alertname,
                    value: alert.annotations.description,
                    inline: false,
                })
            }

            return fieldArray
        } else {
            return []
        }
    }
}