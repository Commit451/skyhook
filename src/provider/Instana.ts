import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'
import { EmbedField } from '../model/EmbedField'
import { DateTime } from 'luxon'

enum InstanaEventType {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    CHANGE_EVENT = 'CHANGE EVENT'
}

/**
 * https://www.instana.com/docs/ecosystem/webhook/
 */
class Instana extends BaseProvider {

    constructor() {
        super()
        this.setEmbedColor(0x54C0DE)
    }

    private getEventType() {
        return this.body.issue.state || InstanaEventType.CHANGE_EVENT
    }

    private addField(embed: Embed, isInline: boolean, fieldName: string, fieldValue: string, isValueDate: boolean): void {
        if (!fieldValue) {
            return
        }
        const field = new EmbedField()
        field.inline = isInline
        field.name = fieldName
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field.value = isValueDate ? DateTime.fromMillis(fieldValue as any as number).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) : fieldValue
        embed.fields.push(field)
    }

    private parseOpenIncident(embed: Embed): Embed {
        embed.title = 'Issue Opened'
        embed.url = this.body.issue.link
        this.addField(embed, false, 'Id', this.body.issue.id, false)
        this.addField(embed, false, 'Description', this.body.issue.text, false)
        this.addField(embed, false, 'Suggestion', this.body.issue.suggestion, false)
        this.addField(embed, false, 'Start Time', this.body.issue.start, true)
        this.addField(embed, false, 'End Time', this.body.issue.end, true)
        return embed
    }

    private parseClosedIncident(embed: Embed): Embed {
        embed.title = 'Issue Closed'
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

    public getName(): string {
        return 'Instana'
    }

    public getPath(): string {
        return 'instana'
    }

    public async parseData(): Promise<void> {
        const embed = new Embed()
        embed.fields = []
        switch (this.getEventType()) {
            case InstanaEventType.OPEN: {
                this.addEmbed(this.parseOpenIncident(embed))
                break
            }
            case InstanaEventType.CLOSED: {
                this.addEmbed(this.parseClosedIncident(embed))
                break
            }
            case InstanaEventType.CHANGE_EVENT: {
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
