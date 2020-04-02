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

    public getName() {
        return 'Jira'
    }

    public getPath() {
        return 'jira'
    }

    public async parseData() {
        if (this.body.webhookEvent == null) {
            this.payload = null
            return
        }

        let isIssue: boolean
        if (this.body.webhookEvent.startsWith('jira:issue_')) {
            isIssue = true
        } else if (this.body.webhookEvent.startsWith('comment_')) {
            isIssue = false
        } else {
            return
        }

        // extract variable from Jira
        const issue = this.body.issue
        if (issue.fields.assignee == null) {
            issue.fields.assignee = {displayName: 'nobody'}
        }
        const user = this.body.user
        const action = this.body.webhookEvent.split('_')[1]
        const matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i)
        const domain = matches && matches[1]

        // create the embed
        const embed = new Embed()
        embed.title = `${issue.key} - ${issue.fields.summary}`
        embed.url = `${domain}/browse/${issue.key}`
        if (isIssue) {
            embed.description = `${user.displayName} ${action} issue: ${embed.title} (${issue.fields.assignee.displayName})`
        } else {
            const comment = this.body.comment
            embed.description = `${comment.updateAuthor.displayName} ${action} comment: ${comment.body}`
        }
        this.addEmbed(embed)
    }
}

export { Jira }
