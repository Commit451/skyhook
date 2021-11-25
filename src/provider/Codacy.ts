import { Embed, EmbedField } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications
 */
export class Codacy extends DirectParseProvider {

    public getName(): string {
        return 'Codacy'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0x242c33)
        const embed: Embed = {}
        embed.title = 'New Commit'
        embed.url = this.body.commit.data.urls.delta
        const fields: EmbedField[] = []

        // Results undefined with PR.
        if (this.body.commit.results != null) {
            fields.push({
                name: 'Fixed Issues',
                value: this.body.commit.results.fixed_count || 0,
                inline: true
            })

            fields.push({
                name: 'New Issues',
                value: this.body.commit.results.new_count || 0,
                inline: true
            })
        }
        embed.fields = fields

        this.addEmbed(embed)
    }
}
