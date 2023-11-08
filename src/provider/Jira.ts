import {Embed, EmbedImage, EmbedThumbnail} from '../model/DiscordApi.js'
import { DirectParseProvider } from '../provider/BaseProvider.js'

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
        //If no webhookEvent is provided, return a descriptive message with documentation to help the user configure their request properly
        if (this.body.webhookEvent == null) {
            const embed: Embed={
                description: `An issue has occurred. No \`webhookEvent\` was received with the request. For more information, take a look at the SkyHook documentation TODO.`,
                title: `Problem Occurred`,
                url: ''}
            //todo add documentation link
            this.addEmbed(embed)
        }else {
            // extract variable from Jira
            const issueHasAsignee = this.body?.issue?.fields?.assignee != null
            const issue = this.body.issue
            const user = this.body.user || {displayName: 'Anonymous'}
            const action = this.body.webhookEvent.split(':')[1]

            const tmb: EmbedThumbnail = {
                url: `${this.body.iconUrl}`,
                height: 80,
                width: 80
            }

            const img: EmbedImage = {
                url: `${this.body.iconUrl}`,
                height: 80,
                width: 80
            }

            const embed: Embed = {
                title: `${img} ${issue.key} - ${issue.fields.summary}`,
                thumbnail: tmb,
                image: img,
                // thumbnail: {
                //     url: this.body.iconUrl,
                //     height: 80,
                //     width: 80
                // },
                // image: {
                //     url: this.body.iconUrl,
                //     height: 80,
                //     width: 80
                // },
                url: this.createBrowseUrl(issue)
            }
            // embed.image = img
            // embed.thumbnail = img
            // console.log(img.url)

            switch (this.body.webhookEvent) {
                // case null:
                //     embed.description = `This trigger has not been implemented on SkyHook yet.`
                //     break
                case 'jira:issue_created':
                    embed.description = `${user.displayName} ${action} issue: ${embed.title}${issueHasAsignee ? ` (${issue.fields.assignee.displayName})` : ''} `
                    break
                case 'jira:issue_updated':
                    embed.description = `${user.displayName} ${action} issue: ${embed.title}${issueHasAsignee ? ` (${issue.fields.assignee.displayName})` : ''} `
                    break
                case 'jira:issue_deleted':
                    embed.description = `This trigger has not been implemented on SkyHook yet.`
                    break
                case 'jira:issue_comment_created':
                    const comment = this.body.comment
                    embed.description = `${comment.updateAuthor.displayName} ${action} comment: ${comment.body}`
                    break
                case 'jira:issue_comment_updated':
                    embed.description = `This trigger has not been implemented on SkyHook yet.`
                    break
                case 'jira:issue_comment_deleted':
                    embed.description = `This trigger has not been implemented on SkyHook yet.`
                    break
                case 'jira:worklog_created':
                case 'jira:worklog_updated':
                case 'jira:worklog_deleted':
                case 'jira:version_released':
                case 'jira:version_unreleased':
                case 'jira:version_created':
                case 'jira:version_updated':
                case 'jira:version_deleted':
                case 'jira:version_moved':
                case 'jira:board_created':
                case 'jira:board_updated':
                case 'jira:board_deleted':
                case 'jira:sprint_created':
                case 'jira:sprint_updated':
                case 'jira:sprint_deleted':
                case 'jira:sprint_started':
                case 'jira:sprint_closed':
                case 'jira:sprint_reopened':
                case 'jira:issue_generic':
                case 'jira:issue_assigned':
                    embed.title = 'Trigger not implemented'
                    embed.url = ''
                    embed.description = `This trigger has not been implemented on SkyHook yet.`
                    break
                default:
                    //todo add documentation link
                    embed.title = 'Problem occurred'
                    embed.url = ''
                    embed.description = `An issue has occurred. Make sure you implemented a valid \`webhookEvent\`. For more information, take a look at the SkyHook documentation. Here is what you provided for the webhookEvent: \`${this.body.webhookEvent}\``
                    // embed.description = `An issue has occurred. Make sure you implemented a template from the SkyHook documentation. Here is what you provided for the webhook event: ${this.body.webhookEvent}`
                    break
            }
            this.addEmbed(embed)

        }
    }

    private createBrowseUrl(issue: { self: string, key: string }): string {
        const url: URL = new URL(issue.self)
        const path: string | RegExpMatchArray = url.pathname.match(/.+?(?=\/rest\/api)/) ?? ''
        url.pathname = `${path}/browse/${issue.key}`
        return url.toString()
    }
}
