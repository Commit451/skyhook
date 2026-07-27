import { defineProvider } from './Provider.ts'

/**
 * https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/
 * Example:
 * http://www.domain.com/?monitorID=95987545252&monitorURL=http://test.com&monitorFriendlyName=TestWebsite&alertType=*0&alertDetails=ConnectionTimeout&monitorAlertContacts=457;2;john@doe.com
 */
export const UptimeRobot = defineProvider({
    path: 'uptimerobot',
    name: 'Uptime Robot',
    example: { body: 'uptimerobot/uptimerobot.json' },
    map({ body, query }, output) {
        output.addEmbed({
            title: query.get('monitorFriendlyName') ?? body.monitorFriendlyName,
            url: query.get('monitorURL') ?? body.monitorURL,
            description: query.get('alertDetails') ?? body.alertDetails,
        })
    },
})
