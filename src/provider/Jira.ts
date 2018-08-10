import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

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

        const issue = this.body.issue
        if (issue.fields.assignee === null) {
            issue.fields.assignee = {displayName: 'nobody'}
        }

        // extract variable from Jira
        const user = this.body.user
        const action = this.body.issue_event_type_name.split('_')[1]
        const matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i)
        const domain = matches && matches[1]

        // embed builder
        const embed = new Embed()
        embed.title = `${issue.key} - ${issue.fields.summary}`
        embed.description = `${user.displayName} ${action} the issue ${embed.title} (${issue.fields.assignee.displayName})`
        embed.url = `${domain}/browse/${issue.key}`
        this.addEmbed(embed)
    }
}

export { Jira }
