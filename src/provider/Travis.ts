import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
class Travis extends BaseProvider {

    // States https://github.com/travis-ci/travis-api/blob/master/lib/travis/model/build/states.rb#L25
    private static status_colors = {
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
        let target_body = this.body
        if (this.body.payload != null && typeof this.body.payload === 'string') {
            // Travis now sends data inside of a string payload property.
            try {
                target_body = JSON.parse(this.body.payload)
            }
            catch (error) {
                this.logger.info('Malformed payload JSON from travis.')
                this.logger.error(error)
                target_body = this.body
            }
        }

        embed.title = `[${target_body.repository.name}:${target_body.branch}] Build #${target_body.number}: ${target_body.status_message}`
        embed.url = target_body.build_url
        embed.description = `[\`${target_body.commit.substring(0, 7)}\`](${target_body.compare_url}) ${target_body.message}`

        if(target_body.state != null){
            if(Travis.status_colors[target_body.state] != null) {
                this.setEmbedColor(Travis.status_colors[target_body.state])
            } else {
                this.logger.warn('Unknown Travis build state: ' + target_body.state)
            }
        }

        this.addEmbed(embed)
    }
}

export { Travis }
