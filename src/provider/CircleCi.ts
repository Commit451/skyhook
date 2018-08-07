import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://circleci.com/docs/1.0/configuration/#notify
 */
class CircleCi extends BaseProvider {

    public getName(): string {
        return 'CircleCi'
    }

    public async parseData(req) {
        const subject = this.body.payload.subject.length > 48 ? `${this.body.payload.subject.substring(0, 48)}\u2026` : this.body.payload.subject
        this.setEmbedColor(0x343433)
        const embed = new Embed()
        embed.title = `Build #${this.body.payload.build_num}`
        embed.url = this.body.payload.build_url
        embed.description = `[\`${this.body.payload.vcs_revision.slice(0, 7)}\`](${this.body.payload.compare}) : ${subject} - ${this.body.payload.committer_name}\n\`Outcome\`: ${this.body.payload.outcome}`
        this.addEmbed(embed)
    }
}
export { CircleCi }
