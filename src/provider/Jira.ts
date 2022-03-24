import { Embed, EmbedThumbnail } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'
import { EmbedColors } from '../util/EmbedStyles'
import random from 'random'
/**
 * https://developer.atlassian.com/server/jira/platform/webhooks/
 */
export class Jira extends DirectParseProvider {
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
            this.nullifyPayload()
            return
        }

        let isIssue: boolean
        if (this.body.webhookEvent.startsWith('jira:issue_')) {
            isIssue = true
        } else if (this.body.webhookEvent.startsWith('comment_')) {
            isIssue = false
            if (this.body.issue == null) {
                // What's the point of notifying a new comment if ONLY comment information is sent?
                // Do we care that a comment was made if we cant tell what was commented on?
                // This solution will silence errors until someone makes sense of Atlassian's decisions..
                this.nullifyPayload()
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
        this.setEmbedColor(EmbedColors[random.int(0,EmbedColors.length-1)])
        // create the embed
        const embdThumbnail: EmbedThumbnail = {
            url: user.avatarUrls['48x48'],
            height: 48,
            width: 48
        } || {}
        const embed: Embed = {
            title: `${issue.key} - ${issue.fields.summary}`,
            url: this.createBrowseUrl(issue),
            thumbnail: embdThumbnail
        }
        if (isIssue) {
            // embed.description = `${user.displayName} ${action} issue: ${embed.title}\r\n${issueHasAsignee ? ` (${issue.fields.assignee.displayName})` : ''} `
            embed.description = `**${user.displayName} ${action} issue:** ${embed.title}\r\n${issueHasAsignee ? `**Assigned to:** ${issue.fields.assignee.displayName}` : ''} `
        } else {
            const comment = this.body.comment
            embed.description = `${comment.updateAuthor.displayName} ${action} comment: ${comment.body}`
        }
        this.addEmbed(embed)
    }

    private createBrowseUrl(issue: { self: string, key: string }): string {
        const url: URL = new URL(issue.self)
        const path: string | RegExpMatchArray = url.pathname.match(/.+?(?=\/rest\/api)/) ?? ''
        url.pathname = `${path}/browse/${issue.key}`
        return url.toString()
    }
}
