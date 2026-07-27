import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

// States: https://github.com/travis-ci/travis-api/blob/master/lib/travis/model/build/states.rb#L25
const STATUS_COLORS: Readonly<Record<string, number>> = {
    passed: 0x39aa56,
    failed: 0xdb4545,
    errored: 0xdb4545,
    canceled: 0x9d9d9d,
}

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
export const Travis = defineProvider({
    path: 'travis',
    name: 'Travis',
    example: { body: 'travis/travis.json' },
    defaults: { embedColor: 0x39aa56 },
    map({ body }, output) {
        const embed: Embed = {}
        let targetBody = body
        if (typeof body.payload === 'string') {
            try {
                targetBody = JSON.parse(body.payload)
            } catch (error) {
                output.logger.info('Malformed payload JSON from travis.')
                output.logger.error(error)
            }
        }

        embed.title = `[${targetBody.repository.name}:${targetBody.branch}] Build #${targetBody.number}: ${targetBody.status_message}`
        embed.url = targetBody.build_url
        const msg = targetBody.message.substring(0, targetBody.message.indexOf('\n'))
        embed.description = `[\`${targetBody.commit.substring(0, 7)}\`](${targetBody.compare_url}) ${msg.length > 50 ? msg.substring(0, 47) + '...' : msg}`

        if (targetBody.state != null) {
            const statusColor = STATUS_COLORS[targetBody.state]
            if (statusColor != null) {
                output.setEmbedColor(statusColor)
            } else {
                output.logger.warn('Unknown Travis build state: ' + targetBody.state)
            }
        }

        output.addEmbed(embed)
    },
})
