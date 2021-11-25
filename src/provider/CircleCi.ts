import { Embed } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://circleci.com/docs/1.0/configuration/#notify
 */
export class CircleCi extends DirectParseProvider {

    public getName(): string {
        return 'CircleCi'
    }

    public async parseData(): Promise<void> {
        const subject = this.body.payload.subject.length > 48 ? `${this.body.payload.subject.substring(0, 48)}\u2026` : this.body.payload.subject
        this.setEmbedColor(0x343433)
        const embed: Embed = {
            title: `Build #${this.body.payload.build_num}`,
            url: `Build #${this.body.payload.build_num}`,
            description: `[\`${this.body.payload.vcs_revision.slice(0, 7)}\`](${this.body.payload.compare}) : ${subject} - ${this.body.payload.committer_name}\n\`Outcome\`: ${this.body.payload.outcome}`
        }
        this.addEmbed(embed)
    }
}
