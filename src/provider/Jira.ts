import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://developer.atlassian.com/server/jira/platform/webhooks/
 */
class Jira extends BaseProvider {

    private static capitalize(str: string) {
        const tmp = str.toLowerCase()
        return tmp.charAt(0).toUpperCase() + tmp.slice(1)
    }

    public getName() {
        return 'Jira'
    }

    public getPath() {
        return 'jira'
    }

    public async parseData() {
        this.setEmbedColor(0x1e45a8)

        // We don't support anything else at this time.
        if (!this.body.webhookEvent.startsWith('jira:issue_')) {
            return
        }

        // extract variable from Jira
        const issue = this.body.issue
        const comment = this.body.comment
        const user = this.body.user
        const action = this.body.webhookEvent.split('_')[1]
        const matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i)
        const domain = matches && matches[1]

        if (issue.fields.assignee == null) {
            issue.fields.assignee = {displayName: 'nobody'}
        }

        // embed builder
        const embed = new Embed()
        embed.title = `${issue.key} - ${issue.fields.summary}`

        if (comment != null) {
            embed.description = `${comment.updateAuthor.displayName} commented: ${comment.body}`
        } else {
            embed.description = `${user.displayName} ${action} the issue ${embed.title} (${issue.fields.assignee.displayName})`
        }

        embed.url = `${domain}/browse/${issue.key}`
        this.addEmbed(embed)
    }
}

export { Jira }
