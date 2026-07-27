import { defineProvider } from './Provider.ts'

/**
 * https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload
 */
export const NewRelic = defineProvider({
    path: 'newrelic',
    name: 'New Relic',
    example: { body: 'newrelic/newrelic.json' },
    map({ body }, output) {
        output.addEmbed({
            title: `${body.condition_name} ${body.current_state}`,
            url: body.incident_url,
            description: body.details,
        })
    },
})
