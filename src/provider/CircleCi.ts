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
        this.setEmbedColor(0x343433)

        const sha = this.body.payload.vcs_revision
        const compare = this.body.payload.compare
        const subject = this.body.payload.subject
        const committer = this.body.payload.committer_name
        const outcome = this.body.payload.outcome
        const buildNumber = this.body.payload.build_num
        const buildUrl = this.body.payload.build_url

        let description = ""
        if (sha != null) {
            description += `[${sha.slice(0, 7)}]`
        }
        if (compare != null) {
            description += `(${compare})`
        }
        if (subject != null) {
            description += ' : ' + (subject.length > 48 ? `${subject.substring(0, 48)}\u2026` : subject)
        }
        if (outcome != null) {
            description += '\n\n' + `**Outcome**: ${outcome}`
        }
        const embed: Embed = {
            title: `Build #${buildNumber}`,
            url: buildUrl,
            description: description,
            author: {
                name: committer
            }
        }
        this.addEmbed(embed)
    }
}
