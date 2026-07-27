import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://developer.atlassian.com/server/jira/platform/webhooks/
 */
export const Jira = defineProvider({
    path: 'jira',
    name: 'Jira',
    example: { body: 'jira/jira-issue.json' },
    defaults: { embedColor: 0x1e45a8 },
    map({ body }, output) {
        if (body.webhookEvent == null) {
            output.ignore()
            return
        }

        let isIssue: boolean
        if (body.webhookEvent.startsWith('jira:issue_')) {
            isIssue = true
        } else if (body.webhookEvent.startsWith('comment_')) {
            isIssue = false
            if (body.issue == null) {
                output.ignore()
                return
            }
        } else {
            output.ignore()
            return
        }

        const issueHasAssignee = body.issue?.fields?.assignee != null
        const issue = body.issue
        const user = body.user || { displayName: 'Anonymous' }
        const action = body.webhookEvent.split('_')[1]
        const embed: Embed = {
            title: `${issue.key} - ${issue.fields.summary}`,
            url: createBrowseUrl(issue),
        }
        if (isIssue) {
            embed.description = `${user.displayName} ${action} issue: ${embed.title}${issueHasAssignee ? ` (${issue.fields.assignee.displayName})` : ''} `
        } else {
            const comment = body.comment
            embed.description = `${comment.updateAuthor.displayName} ${action} comment: ${comment.body}`
        }
        output.addEmbed(embed)
    },
})

function createBrowseUrl(issue: { self: string; key: string }): string {
    const url = new URL(issue.self)
    const path = url.pathname.match(/.+?(?=\/rest\/api)/) ?? ''
    url.pathname = `${path}/browse/${issue.key}`
    return url.toString()
}
