import { Embed } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://circleci.com/docs/2.0/webhooks
 */
export class CircleCi extends DirectParseProvider {

    public getName(): string {
        return 'CircleCi'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0x343433)

        const sha = this.body.pipeline.vcs.revision
        const project = this.body.project.name
        const subject = this.body.pipeline.vcs.commit.subject
        const committer = this.body.pipeline.vcs.commit.author.name
        const status = this.body.workflow.status
        const url = this.body.workflow.url
        const number = this.body.pipeline.number
        console.log("sha:" + sha)

        let description = ""
        if (sha != null) {
            description += `[${sha.slice(0, 7)}]`
        }
        if (project != null) {
            description += `(${project})`
        }
        if (subject != null) {
            description += ' : ' + (subject.length > 48 ? `${subject.substring(0, 48)}\u2026` : subject)
        }
        if (status != null) {
            description += '\n\n' + `**Status**: ${status}`
        }
        const embed: Embed = {
            title: `Pipeline #${number}`,
            url: url,
            description: description,
            author: {
                name: committer
            }
        }

        this.addEmbed(embed)
    }
}
