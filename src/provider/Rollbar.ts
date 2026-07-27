import type { Embed } from '../model/DiscordApi.ts'
import { defineEventProvider } from './Provider.ts'

/**
 * https://docs.rollbar.com/docs/webhooks
 */
export const Rollbar = defineEventProvider({
    path: 'rollbar',
    name: 'Rollbar',
    example: { body: 'rollbar/rollbar.json' },
    defaults: { embedColor: 0x3884cb },
    event: 'event_name',
    handlers: {
        exp_repeat_item({ body }, output) {
            output.addEmbed(issueEmbed(`${body.data.occurrence} occurrence of issue`, body))
        },
        deploy({ body }, output) {
            const deploy = body.data.deploy
            output.addEmbed({
                title: `New Deploy to ${deploy.environment}`,
                description: deploy.comment,
            })
        },
        item_velocity({ body }, output) {
            output.addEmbed(issueEmbed('Velocity increase of issue', body))
        },
        new_item({ body }, output) {
            output.addEmbed(issueEmbed('Velocity increase of issue', body))
        },
        occurrence({ body }, output) {
            output.addEmbed(issueEmbed('New issue', body))
        },
        reactivated_item({ body }, output) {
            output.addEmbed(issueEmbed('Issue reactivated', body))
        },
        reopened_item({ body }, output) {
            output.addEmbed(issueEmbed('Issue reopened', body))
        },
        resolved_item({ body }, output) {
            output.addEmbed(issueEmbed('Issue resolved', body))
        },
    },
})

function issueEmbed(title: string, body: Record<string, any>): Embed {
    return { title, description: body.data.item.title }
}
