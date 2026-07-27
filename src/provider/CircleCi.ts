import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://circleci.com/docs/2.0/webhooks
 */
export const CircleCi = defineProvider({
    path: 'circleci',
    name: 'CircleCi',
    example: { body: 'circleci/circleci.json' },
    defaults: { embedColor: 0x343433 },
    map({ body }, output) {
        const sha = body.pipeline.vcs.revision
        const project = body.project.name
        const subject = body.pipeline.vcs.commit.subject
        const committer = body.pipeline.vcs.commit.author.name
        const status = body.workflow.status
        const url = body.workflow.url
        const number = body.pipeline.number
        let description = ''
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
            url,
            description,
            author: {
                name: committer,
            },
        }
        output.addEmbed(embed)
    },
})
