import { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi'
import { TypeParseProvder } from '../provider/BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'

/**
 * https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
 */
export class BitBucket extends TypeParseProvder {

    private static _formatLargeString(str: string, limit = 256): string {
        return str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str
    }

    private static _titleCase(str: string, ifNull = 'None'): string {
        if (str == null) {
            return ifNull
        }
        if (str.length < 1) {
            return str
        }
        const strArray = str.toLowerCase().split(' ')
        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].slice(1)
        }
        return strArray.join(' ')
    }

    private baseLink = 'https://bitbucket.org/'
    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = {}
    }

    public getName(): string {
        return 'BitBucket'
    }

    public getType(): string | null {
        if (this.headers == null) {
            return null
        }
        return this.headers['x-event-key']
    }

    public knownTypes(): string[] {
        return [
            'repoPush',
            'repoFork',
            'repoUpdated',
            'repoCommitCommentCreated',
            'repoCommitStatusCreated',
            'repoCommitStatusUpdated',
            'issueCreated',
            'issueUpdated',
            'issueCommentCreated',
            'pullrequestCreated',
            'pullrequestUpdated',
            'pullrequestApproved',
            'pullrequestUnapproved',
            'pullrequestFulfilled',
            'pullrequestRejected',
            'pullrequestCommentCreated',
            'pullrequestCommentUpdated',
            'pullrequestCommentDeleted',
            'pullrequestChangesRequestCreated',
            'pullrequestChangesRequestRemoved'
        ]
    }

    public async repoPush(): Promise<void> {
        if (this.body.push != null && this.body.push.changes != null) {
            for (let i = 0; (i < this.body.push.changes.length && i < 4); i++) {
                const change = this.body.push.changes[i]
                const embed: Embed = {}

                if (change.new == null && change.old.type === 'branch') {
                    // Branch Deleted
                    embed.title = '[' + this.body.repository.full_name + '] Branch deleted: ' + change.old.name
                } else if (change.old == null && change.new.type === 'branch') {
                    // Branch Created
                    embed.title = '[' + this.body.repository.full_name + '] New branch created: ' + change.new.name
                    embed.url = change.new.links.html.href
                } else if (change.old == null && change.new.type === 'tag') {
                    // Tag Created
                    embed.title = '[' + this.body.repository.full_name + '] New tag created: ' + change.new.name
                    embed.url = change.new.links.html.href
                } else if (change.new == null && change.old.type === 'tag') {
                    // Tag Deleted
                    embed.title = '[' + this.body.repository.full_name + '] Tag deleted: ' + change.old.name
                } else {
                    // Just some commits.
                    const branch = change.new.name
                    const commits = change.commits

                    const fields: EmbedField[] = []
                    let title = `[${this.body.repository.name}]:${branch} `
                    if (commits != null) {
                        title += commits.length + ' commit' + (commits.length > 1 ? 's' : '')
                        for (let j = commits.length - 1; j >= 0; j--) {
                            const commit = commits[j]
                            const message = (commit.message.length > 256) ? commit.message.substring(0, 255) + '\u2026' : commit.message
                            const author = (typeof commit.author.user !== 'undefined') ? commit.author.user.display_name : 'Unknown'
                            fields.push({
                                name: 'Commit from ' + author,
                                value: '(' + '[`' + commit.hash.substring(0, 7) + '`](' + commit.links.html.href + ')' + ') ' + message.replace(/\n/g, ' ').replace(/\r/g, ' ')
                            })
                        }
                    }
                    embed.title = title
                    embed.url = change.links.html.href
                    embed.fields = fields
                }

                embed.author = this.extractAuthor()
                this.addEmbed(embed)
            }
        }
    }

    public async repoFork(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.description = 'Created a [`fork`](' + this.baseLink + this.body.fork.full_name + ') of [`' + this.body.repository.name + '`](' + this.baseLink + this.body.repository.full_name + ')'
        this.addEmbed(this.embed)
    }

    public async repoUpdated(): Promise<void> {

        const changes: string[] = []
        if (typeof this.body.changes.name !== 'undefined') {
            changes.push('**Name:** "' + this.body.changes.name.old + '" -> "' + this.body.changes.name.new + '"')
        }
        if (typeof this.body.changes.website !== 'undefined') {
            changes.push('**Website:** "' + this.body.changes.website.old + '" -> "' + this.body.changes.website.new + '"')
        }
        if (typeof this.body.changes.language !== 'undefined') {
            changes.push('**Language:** "' + this.body.changes.language.old + '" -> "' + this.body.changes.language.new + '"')
        }
        if (typeof this.body.changes.description !== 'undefined') {
            changes.push('**Description:** "' + this.body.changes.description.old + '" -> "' + this.body.changes.description.new + '"')
        }

        this.embed.author = this.extractAuthor()
        this.embed.url = this.baseLink + this.body.repository.full_name
        this.embed.description = changes.join('\n')
        this.embed.title = `[${this.body.repository.full_name}] General information updated`

        this.addEmbed(this.embed)
    }

    public async repoCommitCommentCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] New comment on commit \`${this.body.commit.hash.substring(0, 7)}\``
        this.embed.description = (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + '\u2026' : this.body.comment.content.html.replace(/<.*?>/g, '')
        this.embed.url = this.baseLink + this.body.repository.full_name + '/commits/' + this.body.commit.hash
        this.addEmbed(this.embed)
    }

    public async repoCommitStatusCreated(): Promise<void> {
        this.embed.title = this.body.commit_status.name
        this.embed.description = '**State:** ' + this.body.commit_status.state + '\n' + this.body.commit_status.description
        this.embed.url = this.body.commit_status.url
        this.addEmbed(this.embed)
    }

    public async repoCommitStatusUpdated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = this.body.commit_status.name
        this.embed.url = this.body.commit_status.url
        this.embed.description = '**State:** ' + this.body.commit_status.state + '\n' + this.body.commit_status.description
        this.addEmbed(this.embed)
    }

    public async issueCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Issue opened: #${this.body.issue.id} ${this.body.issue.title}`
        this.embed.url = this.extractIssueUrl()

        const states: string[] = []
        if (this.body.issue.assignee != null && this.body.issue.assignee.display_name != null) {
            states.push('**Assignee:** ' + '[`' + this.body.issue.assignee.display_name + '`](' + this.body.issue.assignee.links.html.href + ')')
        }

        states.push('**State:** `' + BitBucket._titleCase(this.body.issue.state) + '`')
        states.push('**Kind:** `' + BitBucket._titleCase(this.body.issue.kind) + '`')
        states.push('**Priority:** `' + BitBucket._titleCase(this.body.issue.priority) + '`')

        if (this.body.issue.component != null && this.body.issue.component.name != null) {
            states.push('**Component:** `' + BitBucket._titleCase(this.body.issue.component.name) + '`')
        }

        if (this.body.issue.milestone != null && this.body.issue.milestone.name != null) {
            states.push('**Milestone:** `' + BitBucket._titleCase(this.body.issue.milestone.name) + '`')
        }

        if (this.body.issue.version != null && this.body.issue.version.name != null) {
            states.push('**Version:** `' + BitBucket._titleCase(this.body.issue.version.name) + '`')
        }

        if (this.body.issue.content.raw) {
            states.push('**Content:**\n' + MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(this.body.issue.content.raw), this.embed))
        }

        this.embed.description = states.join('\n')

        this.addEmbed(this.embed)
    }

    public async issueUpdated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Issue updated: #${this.body.issue.id} ${this.body.issue.title}`
        this.embed.url = this.extractIssueUrl()
        const changes = []

        if (typeof this.body.changes !== 'undefined') {
            const states = ['old', 'new']

            const labels = ['Assignee', 'Responsible']
            labels.forEach((label) => {
                const actor = this.body.changes[label.toLowerCase()]

                if (actor == null) {
                    return
                }

                const actorNames: { [state: string]: string } = {}
                const unassigned = '`Unassigned`'

                states.forEach((state) => {
                    if (actor[state] != null && actor[state].username != null) {
                        actorNames[state] = '[`' + actor[state].display_name + '`](' + actor[state].links.html.href + ')'
                    } else {
                        actorNames[state] = unassigned
                    }
                })

                if (!Object.keys(actorNames).length || (actorNames.old === unassigned && actorNames.new === unassigned)) {
                    return
                }

                changes.push('**' + label + ':** ' + actorNames.old + ' \uD83E\uDC6A ' + actorNames.new)
            });

            ['Kind', 'Priority', 'Status', 'Component', 'Milestone', 'Version'].forEach((label) => {
                const property = this.body.changes[label.toLowerCase()]

                if (typeof property !== 'undefined') {
                    changes.push('**' + label + ':** `' + BitBucket._titleCase(property.old) + '` \uD83E\uDC6A `' + BitBucket._titleCase(property.new) + '`')
                }
            })

            {
                const label = 'Content'
                const property = this.body.changes[label.toLowerCase()]

                if (typeof property !== 'undefined') {
                    changes.push('**New ' + label + ':** \n' + MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(property.new), this.embed))
                }
            }
        }

        this.embed.description = changes.join('\n')

        this.addEmbed(this.embed)
    }

    public async issueCommentCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] New comment on issue #${this.body.issue.id}: ${this.body.issue.title}`
        this.embed.url = this.extractIssueUrl()
        this.embed.description = MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(this.body.comment.content.raw), this.embed)
        this.addEmbed(this.embed)
    }

    public async pullrequestCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Pull request opened: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.embed.description = this.body.pullrequest.description
        this.embed.fields = [this.extractPullRequestField()]
        this.addEmbed(this.embed)
    }

    public async pullrequestUpdated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Updated pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.embed.description = this.body.pullrequest.description
        this.embed.fields = [this.extractPullRequestField()]
        this.addEmbed(this.embed)
    }

    public async pullrequestApproved(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Approved pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.setEmbedColor(0x2db83d)
        this.addEmbed(this.embed)
    }

    public async pullrequestUnapproved(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Removed approval for pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    public async pullrequestFulfilled(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Merged pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    public async pullrequestRejected(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Rejected pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.embed.description = (typeof this.body.pullrequest.reason !== 'undefined') ? ((this.body.pullrequest.reason.replace(/<.*?>/g, '').length > 1024) ? this.body.pullrequest.reason.replace(/<.*?>/g, '').substring(0, 1023) + '\u2026' : this.body.pullrequest.reason.replace(/<.*?>/g, '')) : ''
        this.addEmbed(this.embed)
    }

    public async pullrequestCommentCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] New comment on pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.embed.description = (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + '\u2026' : this.body.comment.content.html.replace(/<.*?>/g, '')
        this.addEmbed(this.embed)
    }

    public async pullrequestCommentUpdated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Updated comment on pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.embed.description = (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + '\u2026' : this.body.comment.content.html.replace(/<.*?>/g, '')
        this.addEmbed(this.embed)
    }

    public async pullrequestCommentDeleted(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Deleted comment on pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.description = (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + '\u2026' : this.body.comment.content.html.replace(/<.*?>/g, '')
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    public async pullrequestChangesRequestCreated(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Changes requested for pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.setEmbedColor(0xffa500)
        this.addEmbed(this.embed)
    }

    public async pullrequestChangesRequestRemoved(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.repository.full_name}] Removed changes requested for pull request: #${this.body.pullrequest.id} ${this.body.pullrequest.title}`
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    private extractAuthor(): EmbedAuthor {
        const author: EmbedAuthor = {
            name: this.body.actor.display_name
        }
        if (this.body.actor.links === undefined) {
            author.icon_url = 'http://i0.wp.com/avatar-cdn.atlassian.com/default/96.png'
            author.url = ''
        } else {
            author.icon_url = this.body.actor.links.avatar.href
            author.url = this.baseLink + this.body.actor.username
        }
        return author
    }

    private extractPullRequestUrl(): string {
        return this.baseLink + this.body.repository.full_name + '/pull-requests/' + this.body.pullrequest.id
    }

    private extractPullRequestField(): EmbedField {
        return {
            name: this.body.pullrequest.title,
            value: '**Destination branch:** ' + this.body.pullrequest.destination.branch.name + '\n' + '**State:** ' + this.body.pullrequest.state + '\n'
        }
    }

    private extractIssueUrl(): string {
        return this.baseLink + this.body.repository.full_name + '/issues/' + this.body.issue.id
    }
}
