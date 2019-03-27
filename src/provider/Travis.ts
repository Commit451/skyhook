import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
class Travis extends BaseProvider {

    private static status_colors = {
        'still broken': 0xff0000,
        'still failing': 0xb04632,
        broken: 0xff0000,
        pending: 0x04d9e3,
        failed: 0x519839,
        errored: 0x89609e,
        fixed: 0xcd5a91,
        passed: 0x4bbf6b,
        travis: 0xccddff
    }

    public getName() {
        return 'Travis'
    }

    public async parseData() {
        this.setEmbedColor(0xC7B398)
        const embed = new Embed()
        let target_body = this.body
        if (this.body.payload !== null && typeof this.body.payload === "string") {
            // for some reason, Travis-CI has switched up on us and
            // is sending the payload nested, rather than top-level
            // set a different body and parse it appropriately
            this.logger.debug('Travis-CI is not following its own documentation and so we are parsing the body.payload string.');
            try {
                target_body = JSON.parse(this.body.payload)
            }
            catch (error) {
                this.logger.info('falling back to body, failed to parse body.payload string: ' + error.stack)
                // do not care about errors here;
                // just go back to using usual body and pray it works
                target_body = this.body
            }
        }
        embed.title = 'Build #' + target_body.number
        embed.url = target_body.build_url
        embed.description = '**Branch**: ' + target_body.branch + '\n**Status**: ' + target_body.status_message
        const author = new EmbedAuthor()
        author.name = this.headers['Travis-Repo-Slug'] || this.headers['travis-repo-slug'] || (target_body.repository.owner_name + '/' + target_body.repository.name)
        embed.author = author
        if (typeof target_body.status_message === 'string') {
            const status: string = target_body.status_message.toLowerCase();
            embed.color = Travis.status_colors['travis']
            if (Travis.status_colors[status] !== null) {
                embed.color = Travis.status_colors[status]
            }
            else {
                Object.getOwnPropertyNames(Travis.status_colors).every(
                    function (element: string, index: number, color_names: string[]) {
                        if (status.indexOf(element) > -1) {
                            embed.color = Travis.status_colors[element]
                            return false
                        }
                    }
                )
            }
        }
        this.addEmbed(embed)
    }
}

export { Travis }
