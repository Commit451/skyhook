import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://www.appveyor.com/docs/notifications/#webhook-payload-default
 */
export const AppVeyor = defineProvider({
    path: 'appveyor',
    name: 'AppVeyor',
    example: { body: 'appveyor/appveyor.json' },
    defaults: { embedColor: 0x00b3e0 },
    map({ body }, output) {
        const embed: Embed = {
            title: 'Build ' + body.eventData.buildVersion,
            url: body.eventData.buildUrl,
            description: body.eventData.commitMessage + '\n\n' + '**Status**: ' + body.eventData.status,
            author: {
                name: body.eventData.commitAuthor,
            },
        }
        if (body.eventData.repositoryProvider === 'gitHub') {
            embed.author!.url =
                'https://github.com/' + body.eventData.repositoryName + '/commit/' + body.eventData.commitId
        }

        if (body.eventData.jobs[0].artifacts.length !== 0) {
            embed.description += '\n**Artifacts**:'
            for (const artifact of body.eventData.jobs[0].artifacts) {
                embed.description += '\n- [' + artifact.fileName + '](' + artifact.permalink + ')'
            }
        }
        output.addEmbed(embed)
    },
})
