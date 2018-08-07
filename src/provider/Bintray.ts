import { Embed } from '../model/Embed'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../provider/BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'

/**
 * https://bintray.com/docs/api/#_webhooks
 */
class Bintray extends BaseProvider {

    public getName() {
        return 'Bintray'
    }

    public async parseData() {
        this.setEmbedColor(0x43a047)
        const embed = new Embed()
        embed.timestamp = this.body.released
        embed.title = this.body.package + ' v' + this.body.version + ' Released'
        const fields: EmbedField[] = []
        if (this.body.release_notes != null && this.body.release_notes) {
            const field = new EmbedField()
            field.inline = false
            field.name = 'Release Notes'
            field.value = MarkdownUtil._formatMarkdown(this.body.release_notes, embed)
            fields.push(field)
        }
        embed.fields = fields
        this.addEmbed(embed)
    }
}

export { Bintray }
