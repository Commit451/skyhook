import { defineEventProvider } from './Provider.ts'

/**
 * https://learn.microsoft.com/en-us/appcenter/dashboard/webhooks/
 */
export const AppCenter = defineEventProvider({
    path: 'appcenter',
    name: 'AppCenter',
    example: { body: 'appcenter/appcenter-pipeline.json' },
    defaults: { embedColor: 0xcb2e62 },
    event({ body }) {
        if (body.build_status) return 'pipeline'
        if (body.release_id) return 'distribute'
        return null
    },
    handlers: {
        pipeline({ body }, output) {
            output.addEmbed({
                title: `Pipeline #${body.build_id} on ${body.app_name}`,
                url: body.build_link,
                description: `**Status**: ${body.build_status} ${emojiStatus(body.build_status)}`,
            })
        },
        distribute({ body }, output) {
            const information = [
                `**Version**: ${body.short_version} (${body.version})`,
                `**Platform**: ${body.platform}`,
            ]
            if (body.release_notes) {
                information.push(`**Release notes**: ${body.release_notes}`)
            }
            output.addEmbed({
                title: `Distribute #${body.release_id} on ${body.app_name}`,
                url: body.install_link,
                description: information.join('\n'),
            })
        },
    },
})

function emojiStatus(status: string): string {
    switch (status) {
        case 'Canceled':
            return '🚫'
        case 'Failed':
            return '❌'
        case 'Succeeded':
            return '✅'
        case 'SucceededWithIssues':
            return '⚠️'
        default:
            return ''
    }
}
