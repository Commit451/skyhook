import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://developer.atlassian.com/server/jira/platform/webhooks/
 */
class Jira extends BaseProvider {
    constructor() {
        super()
        this.setEmbedColor(0x1e45a8)
    }

    public getName(): string {
        return 'Jira'
    }

    public getPath(): string {
        return 'jira'
    }

    public async parseData(): Promise<void> {
        if (this.body.webhookEvent == null) {
            this.payload = null
            return
        }

        let isIssue: boolean
        if (this.body.webhookEvent.startsWith('jira:issue_')) {
            isIssue = true
        } else if (this.body.webhookEvent.startsWith('comment_')) {
            isIssue = false
            if(this.body.issue == null) {
                // What's the point of notifying a new comment if ONLY comment information is sent?
                // Do we care that a comment was made if we cant tell what was commented on?
                // This solution will silence errors until someone makes sense of Atlassian's decisions..
                this.payload = null
                return
            }
        } else {
            return
        }

        // extract variable from Jira
        const issueHasAsignee = this.body?.issue?.fields?.assignee != null
        const issue = this.body.issue
        const user = this.body.user || { displayName: 'Anonymous' }
        const action = this.body.webhookEvent.split('_')[1]

        // create the embed
        const embed = new Embed()
        embed.title = `${issue.key} - ${issue.fields.summary}`
        embed.url = this.createBrowseUrl(issue)
        if (isIssue) {
            embed.description = `${user.displayName} ${action} issue: ${embed.title}${issueHasAsignee ? ` (${issue.fields.assignee.displayName})` : ''} `
        } else {
            const comment = this.body.comment
            embed.description = `${comment.updateAuthor.displayName} ${action} comment: ${comment.body}`
        }
        this.addEmbed(embed)
    }

    private createBrowseUrl(issue): string {
        const url: URL = new URL(issue.self)
        const path: string|RegExpMatchArray = url.pathname.match(/.+?(?=\/rest\/api)/) ?? ''
        url.pathname = `${path}/browse/${issue.key}`
        return url.toString()
    }
}

export { Jira }
