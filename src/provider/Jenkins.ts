import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://plugins.jenkins.io/notification
 */
export const Jenkins = defineProvider({
    path: 'jenkins',
    name: 'Jenkins-CI',
    example: { body: 'jenkins/jenkins.json' },
    defaults: { embedColor: 0xf0d6b7 },
    map({ body }, output) {
        const phase = body.build.phase
        const embed: Embed = {
            title: 'Project ' + body.name,
            url: body.build.full_url,
        }
        switch (phase) {
            case 'STARTED':
                embed.description = 'Started build #' + body.build.number
                break
            case 'COMPLETED':
            case 'FINALIZED':
                embed.description =
                    capitalize(phase) + ' build #' + body.build.number + ' with status: ' + body.build.status
                break
        }
        output.addEmbed(embed)
    },
})

function capitalize(value: string): string {
    const lowerCase = value.toLowerCase()
    return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}
