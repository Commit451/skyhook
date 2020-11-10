import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'
import { EmbedField } from '../model/EmbedField'

/**
 * https://www.instana.com/docs/ecosystem/webhook/
 */
class Instana extends BaseProvider {

    constructor() {
        super()
        this.setEmbedColor(0x54C0DE)
    }

    private getEventType() {
        return this.body.issue.state || 'CHANGE EVENT'
    }

    private addField(embed: Embed, isInline: boolean, fieldName: string, fieldValue: string, isValueDate: boolean): Embed {
        if (!fieldValue) {
            return embed
        }
        const field = new EmbedField()
        field.inline = isInline
        field.name = fieldName
        field.value = isValueDate ? new Date(fieldValue).toISOString() : fieldValue
        embed.fields.push(field)
        return embed
    }

    private parseOpenIncident(embed: Embed): Embed {
        embed.title = 'Issue is opened'
        embed.url = this.body.issue.link
        this.addField(embed, false, 'Id', this.body.issue.id, false)
        this.addField(embed, false, 'Description', this.body.issue.text, false)
        this.addField(embed, false, 'Suggestion', this.body.issue.suggestion, false)
        this.addField(embed, false, 'Start Time', this.body.issue.start, true)
        this.addField(embed, false, 'End Time', this.body.issue.end, true)
        return embed
    }

    private parseClosedIncident(embed: Embed): Embed {
        embed.title = 'Issue is closed'
        this.addField(embed, false, 'Id', this.body.issue.id, false)
        this.addField(embed, false, 'Start Time', this.body.issue.start, true)
        this.addField(embed, false, 'End Time', this.body.issue.end, true)
        return embed
    }

    private parseChangeEvent(embed: Embed): Embed {
        embed.url = this.body.issue.link
        embed.title = this.body.issue.text
        this.addField(embed, false, 'Id', this.body.issue.id, false)
        this.addField(embed, false, 'Description', this.body.issue.description, false)
        this.addField(embed, false, 'Start Time', this.body.issue.start, true)
        this.addField(embed, false, 'End Time', this.body.issue.end, true)
        this.addField(embed, false, 'Type', this.body.issue.type, false)
        return embed
    }

    private parseUnrecognizedType(embed: Embed): Embed {
        embed.title = 'Unrecognized Webhook Type'
        embed.url = this.body.issue.link
        return embed
    }

    public getName() {
        return 'Instana'
    }

    public getPath() {
        return 'instana'
    }

    public async parseData() {
        const embed = new Embed()
        embed.fields = []
        switch (this.getEventType()) {
            case 'OPEN': {
                this.addEmbed(this.parseOpenIncident(embed))
                break
            }
            case 'CLOSED': {
                this.addEmbed(this.parseClosedIncident(embed))
                break
            }
            case 'CHANGE EVENT': {
                this.addEmbed(this.parseChangeEvent(embed))
                break
            }
            default: {
                this.addEmbed(this.parseUnrecognizedType(embed))
                break
            }
        }
    }
}

export { Instana }
