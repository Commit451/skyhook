import { BaseProvider } from "../util/BaseProvider"

/**
 * https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
 */
class BitBucket extends BaseProvider {

    public static getName() {
        return 'BitBucket'
    }

    private static _formatLargeString(str, limit = 256) {
        return (str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str)
    }

    private static _titleCase(str: string, ifNull = 'None') {
        if (str == null) {
            return ifNull
        }
        if (str.length < 1) {
            return str
        }
        str = str.toLowerCase().split(' ')
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
        }
        return str.join(' ')
    }

    private baseLink: string = 'https://bitbucket.org/'

    constructor() {
        super()
        this.setEmbedColor(0x205081)
    }

    public getType(): string {
        return this.req.get('X-Event-Key')
    }

    public async repoPush() {
        const project = {
            name: this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name,
            branch: null,
            commits: null,
        }
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }
        for (let i = 0; (i < this.body.push.changes.length && i < 4); i++) {
            const change = this.body.push.changes[i]
            project.branch = (change.old !== null) ? change.old.name : change.new.name
            project.commits = change.commits

            const commits = []
            for (let j = 0; j < project.commits.length; j++) {
                const commit = project.commits[j]
                const message = (commit.message.length > 256) ? commit.message.substring(0, 255) + "\u2026" : commit.message
                const author = (typeof commit.author.user !== "undefined") ? commit.author.user.display_name : "Unknown"

                commits.push({
                    name: "Commit from " + author,
                    value: "(" + "[`" + commit.hash.substring(0, 7) + "`](" + commit.links.html.href + ")" + ") " + message.replace(/\n/g, " ").replace(/\r/g, " "),
                    inline: false,
                })
            }

            this.payload.addEmbed({
                title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                url: project.url,
                author: user,
                fields: commits,
            })
        }
    }

    public async repoFork() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }
        this.payload.addEmbed({
            author: user,
            description: "Created a [`fork`](" + this.baseLink + this.body.fork.full_name + ") of [`" + this.body.repository.name + "`](" + this.baseLink + this.body.repository.full_name + ")"
        })
    }

    public async repoUpdated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        const changes = []
        if (typeof this.body.changes.name !== "undefined") {
            changes.push("**Name:** \"" + this.body.changes.name.old + "\" -> \"" + this.body.changes.name.new + "\"")
        }
        if (typeof this.body.changes.website !== "undefined") {
            changes.push("**Website:** \"" + this.body.changes.website.old + "\" -> \"" + this.body.changes.website.new + "\"")
        }
        if (typeof this.body.changes.language !== "undefined") {
            changes.push("**Language:** \"" + this.body.changes.language.old + "\" -> \"" + this.body.changes.language.new + "\"")
        }
        if (typeof this.body.changes.description !== "undefined") {
            changes.push("**Description:** \"" + this.body.changes.description.old + "\" -> \"" + this.body.changes.description.new + "\"")
        }

        this.payload.addEmbed({
            author: user,
            title: "Changed general information of " + body.repository.name,
            url: this.baseLink + body.repository.full_name,
            description: changes.join("\n"),
        })
    }

    public async repoCommitCommentCreated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Wrote a comment to commit " + this.body.commit.hash.substring(0, 7) + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/commits/" + this.body.commit.hash,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }

    async repoCommitStatusCreated() {
        this.payload.addEmbed({
            author: {
                name: this.body.repository.name,
                url: this.baseLink + this.body.repository.full_name,
                icon_url: this.body.repository.links.avatar.href
            },
            title: this.body.commit_status.name,
            url: this.body.commit_status.url,
            description: "**State:** " + this.body.commit_status.state + "\n" + this.body.commit_status.description
        })
    }

    public async repoCommitStatusUpdated() {
        this.payload.addEmbed({
            author: {
                name: this.body.repository.name,
                url: this.baseLink + this.body.repository.full_name,
                icon_url: this.body.repository.links.avatar.href,
            },
            title: this.body.commit_status.name,
            url: this.body.commit_status.url,
            description: "**State:** " + this.body.commit_status.state + "\n" + this.body.commit_status.description,
        })
    }

    async issueCreated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        const states = []
        const embed = {
            author: user,
            title: '[' + this.body.repository.owner.username + '/' + this.body.repository.name + '] Issue Opened: #' + this.body.issue.id + ' ' + this.body.issue.title,
            url: this.baseLink + this.body.repository.full_name + '/issues/' + this.body.issue.id,
        }

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
            states.push('**Content:**\n' + MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(this.body.issue.content.raw, embed)))
        }

        embed.description = states.join('\n')

        this.payload.addEmbed(embed)
    }

    public async issueUpdated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        }

        const changes = []

        const embed = {
            author: user,
            title: '[' + this.body.repository.owner.username + '/' + this.body.repository.name + '] Issue Updated: #' + this.body.issue.id + ' ' + this.body.issue.title,
            url: this.baseLink + this.body.repository.full_name + '/issues/' + this.body.issue.id
        }

        if (typeof this.body.changes !== 'undefined') {
            const states = ['old', 'new']

            ['Assignee', 'Responsible'].forEach((label) => {
                const actor = this.body.changes[label.toLowerCase()]

                if (actor == null) {
                    return
                }

                const actorNames = {}
                const unassigned = '`Unassigned`'

                states.forEach((state) => {
                    if (actor[state] != null && actor[state].username != null) {
                        actorNames[state] = '[`' + actor[state].display_name + '`](' + actor[state].links.html.href + ')';
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
                    changes.push('**New ' + label + ':** \n' + MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(property.new, embed)))
                }
            }
        }

        embed.description = changes.join('\n')

        this.payload.addEmbed(embed)
    }

    public async issueCommentCreated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        const embed = {
            author: user,
            title: '[' + this.body.repository.owner.username + '/' + this.body.repository.name + '] New comment on issue #' + this.body.issue.id + ': ' + this.body.issue.title,
            url: this.baseLink + this.body.repository.full_name + "/issues/" + this.body.issue.id,
        }

        embed.description = MarkdownUtil._formatMarkdown(BitBucket._formatLargeString(this.body.comment.content.raw), embed)

        this.payload.addEmbed(embed)
    }

    public async pullrequestCreated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Created a new pull request on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: this.body.pullrequest.description,
            fields: [
                {
                    name: this.body.pullrequest.title,
                    value: "**Destination branch:** " + this.body.pullrequest.destination.branch.name + "\n" +
                    "**State:** " + this.body.pullrequest.state + "\n",
                },
            ],
        })
    }

    public async pullrequestUpdated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Updated pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: this.body.pullrequest.description,
            fields: [
                {
                    name: this.body.pullrequest.title,
                    value: "**Destination branch:** " + this.body.pullrequest.destination.branch.name + "\n" +
                    "**State:** " + this.body.pullrequest.state + "\n",
                },
            ],
        })
    }

    public async pullrequestApproved() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Approved pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
        })
    }

    public async pullrequestUnapproved() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Removed his approval for pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
        })
    }

    public async pullrequestFulfilled() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Merged pull request #" + this.body.pullrequest.id + " into " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
        })
    }

    public async pullrequestRejected() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Declined pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (typeof this.body.pullrequest.reason !== "undefined") ? ((this.body.pullrequest.reason.replace(/<.*?>/g, '').length > 1024) ? this.body.pullrequest.reason.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.pullrequest.reason.replace(/<.*?>/g, '')) : "",
        })
    }

    public async pullrequestCommentCreated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Wrote a comment to pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, ''),
        })
    }

    public async pullrequestCommentUpdated() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Updated a comment at pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, ''),
        })
    }

    public async pullrequestCommentDeleted() {
        const user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username,
        }

        this.payload.addEmbed({
            author: user,
            title: "Deleted a comment at pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, ''),
        })
    }
}
export { BitBucket }
