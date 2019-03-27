import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
class Travis extends BaseProvider {

    // States https://github.com/travis-ci/travis-api/blob/master/lib/travis/model/build/states.rb#L25
    private static STATUS_COLORS = {
        passed: 0x39aa56,
        failed: 0xdb4545,
        errored: 0xdb4545,
        canceled: 0x9d9d9d
    }

    public getName() {
        return 'Travis'
    }

    public async parseData() {
        this.setEmbedColor(0x39aa56)
        const embed = new Embed()
        let targetBody = this.body
        if (this.body.payload != null && typeof this.body.payload === 'string') {
            // Travis now sends data inside of a string payload property.
            try {
                targetBody = JSON.parse(this.body.payload)
            } catch (error) {
                this.logger.info('Malformed payload JSON from travis.')
                this.logger.error(error)
                targetBody = this.body
            }
        }

        embed.title = `[${targetBody.repository.name}:${targetBody.branch}] Build #${targetBody.number}: ${targetBody.status_message}`
        embed.url = targetBody.build_url
        const msg = targetBody.message.substring(0, targetBody.message.indexOf('\n'))
        embed.description = `[\`${targetBody.commit.substring(0, 7)}\`](${targetBody.compare_url}) ${(msg.length > 50) ? msg.substring(0, 47) + '...' : msg}`

        if (targetBody.state != null) {
            if (Travis.STATUS_COLORS[targetBody.state] != null) {
                this.setEmbedColor(Travis.STATUS_COLORS[targetBody.state])
            } else {
                this.logger.warn('Unknown Travis build state: ' + targetBody.state)
            }
        }

        this.addEmbed(embed)
    }
}

export { Travis }
