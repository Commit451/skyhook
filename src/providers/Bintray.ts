import { BaseProvider } from "../util/BaseProvider"

/**
 * https://bintray.com/docs/api/#_webhooks
 */
class Bintray extends BaseProvider {

    public static getName() {
        return 'Bintray'
    }

    public async parseData() {
        this.payload.setEmbedColor('0x43a047')
        const embed = {
            timestamp: this.body.released,
            title: this.body.package + ' v' + this.body.version + ' Released',
        }
        const fields: any[] = []
        if (this.body.release_notes != null && this.body.release_notes) {
            const field = {
                inline: false,
                name: 'Release Notes',
                value: MarkdownUtil._formatMarkdown(this.body.release_notes),
            }
            fields.push(field)
        }
        this.payload.addEmbed(embed)
    }
}

export { Bintray }
