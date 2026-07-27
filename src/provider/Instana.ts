import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
})

const InstanaEventType = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    CHANGE_EVENT: 'CHANGE EVENT',
} as const

/**
 * https://www.instana.com/docs/ecosystem/webhook/
 */
export const Instana = defineProvider({
    path: 'instana',
    name: 'Instana',
    example: { body: 'instana/instana.json' },
    defaults: { embedColor: 0x54c0de },
    map({ body }, output) {
        const embed: Embed = { fields: [] }
        const eventType = body.issue.state || InstanaEventType.CHANGE_EVENT
        switch (eventType) {
            case InstanaEventType.OPEN:
                formatOpenIncident(body, embed)
                break
            case InstanaEventType.CLOSED:
                formatClosedIncident(body, embed)
                break
            case InstanaEventType.CHANGE_EVENT:
                formatChangeEvent(body, embed)
                break
            default:
                embed.title = 'Unrecognized Webhook Type'
                embed.url = body.issue.link
                break
        }
        output.addEmbed(embed)
    },
})

function addField(
    embed: Embed,
    inline: boolean,
    name: string,
    fieldValue: string | number,
    isValueDate: boolean,
): void {
    if (!fieldValue) return
    embed.fields!.push({
        name,
        value: isValueDate ? dateFormatter.format(new Date(fieldValue as number)) : (fieldValue as string),
        inline,
    })
}

function formatOpenIncident(body: Record<string, any>, embed: Embed): void {
    embed.title = 'Issue Opened'
    embed.url = body.issue.link
    addField(embed, false, 'Id', body.issue.id, false)
    addField(embed, false, 'Description', body.issue.text, false)
    addField(embed, false, 'Suggestion', body.issue.suggestion, false)
    addField(embed, false, 'Start Time', body.issue.start, true)
    addField(embed, false, 'End Time', body.issue.end, true)
}

function formatClosedIncident(body: Record<string, any>, embed: Embed): void {
    embed.title = 'Issue Closed'
    addField(embed, false, 'Id', body.issue.id, false)
    addField(embed, false, 'Start Time', body.issue.start, true)
    addField(embed, false, 'End Time', body.issue.end, true)
}

function formatChangeEvent(body: Record<string, any>, embed: Embed): void {
    embed.url = body.issue.link
    embed.title = body.issue.text
    addField(embed, false, 'Id', body.issue.id, false)
    addField(embed, false, 'Description', body.issue.description, false)
    addField(embed, false, 'Start Time', body.issue.start, true)
    addField(embed, false, 'End Time', body.issue.end, true)
    addField(embed, false, 'Type', body.issue.type, false)
}
