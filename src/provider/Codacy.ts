import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications
 */
export const Codacy = defineProvider({
    path: 'codacy',
    name: 'Codacy',
    example: { body: 'codacy/codacy.json' },
    defaults: { embedColor: 0x242c33 },
    map({ body }, output) {
        const embed: Embed = {
            title: 'New Commit',
            url: body.commit.data.urls.delta,
        }
        const fields: EmbedField[] = []

        // Results are undefined for pull requests.
        if (body.commit.results != null) {
            fields.push({
                name: 'Fixed Issues',
                value: String(body.commit.results.fixed_count || 0),
                inline: true,
            })
            fields.push({
                name: 'New Issues',
                value: String(body.commit.results.new_count || 0),
                inline: true,
            })
        }
        embed.fields = fields
        output.addEmbed(embed)
    },
})
