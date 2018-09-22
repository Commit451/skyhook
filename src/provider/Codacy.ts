import { Embed } from '../model/Embed'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications
 */
class Codacy extends BaseProvider {

    public getName(): string {
        return 'Codacy'
    }

    public async parseData() {
        this.setEmbedColor(0x242c33)
        const embed = new Embed()
        embed.title = 'New Commit'
        embed.url = this.body.commit.data.urls.delta
        const fields: EmbedField[] = []

        // Results undefined with PR.
        if (this.body.commit.results != null) {
            const fixedIssueField = new EmbedField()
            fixedIssueField.name = 'Fixed Issues'
            fixedIssueField.value = this.body.commit.results.fixed_count || 0
            fixedIssueField.inline = true
            fields.push(fixedIssueField)

            const newIssuesField = new EmbedField()
            newIssuesField.name = 'New Issues'
            newIssuesField.value = this.body.commit.results.new_count || 0
            newIssuesField.inline = true
            fields.push(newIssuesField)
        }

        this.addEmbed(embed)
    }
}

export { Codacy }
