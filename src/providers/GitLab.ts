import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../util/BaseProvider'

/**
 * https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
 */
class GitLab extends BaseProvider {

    private static _formatAvatarURL(url): string {
        if (!/^https?:\/\/|^\/\//i.test(url)) {
            return 'https://gitlab.com' + url
        }
        return url
    }

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0xFCA326)
        this.embed = new Embed()
    }

    public getName() {
        return 'GitLab'
    }

    public getType(): string {
        return this.body.object_kind
    }

    public async push() {
        const branch = this.body.ref.split('/')
        branch.shift()
        branch.shift()

        const project = {
            name: this.body.project.name,
            url: this.body.project.web_url,
            branch: branch.join('/'),
            commits: this.body.commits
        }

        const fields: EmbedField[] = []
        project.commits.forEach((commit: any) => {
            const message = (commit.message.length > 256) ? commit.message.substring(0, 255) + '\u2026' : commit.message
            const field = new EmbedField()
            field.name = 'Commit from ' + commit.author.name
            field.value = '(' + '[`' + commit.id.substring(0, 7) + '`](' + commit.url + ')' + ') ' + (message == null ? '' : message.replace(/\n/g, ' ').replace(/\r/g, ' '))
            field.inline = false
            fields.push(field)
        })

        this.embed.title = '[' + project.name + ':' + project.branch + '] ' + project.commits.length + ' commit' + ((project.commits.length > 1) ? 's' : '')
        this.embed.url = project.url
        this.embed.author = this.authorFromBodyPush()
        this.embed.fields = fields
        this.addEmbed(this.embed)
    }

    public async tagPush() {
        const tmpTag = this.body.ref.split('/')
        tmpTag.shift()
        tmpTag.shift()
        const tag = tmpTag.join('/')

        const project = {
            name: this.body.project.name,
            url: this.body.project.web_url,
            commits: this.body.commits
        }

        this.embed.url = project.url + '/tags/' + tag
        this.embed.author = this.authorFromBodyPush()
        this.embed.description = (typeof this.body.message !== 'undefined') ? ((this.body.message.length > 1024) ? this.body.message.substring(0, 1023) + '\u2026' : this.body.message) : ''
        if (this.body.after !== '0000000000000000000000000000000000000000') {
            this.embed.title = `Pushed tag "${tag}" to ${project.name}`
        } else {
            this.embed.title = `Deleted tag "${tag}" to ${project.name}`
        }
        this.addEmbed(this.embed)
    }

    public async issue() {
        const actions = {
            open: 'Opened',
            close: 'Closed',
            reopen: 'Reopened',
            update: 'Updated'
        }

        this.embed.title = actions[this.body.object_attributes.action] + ' issue #' + this.body.object_attributes.iid + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        const field = new EmbedField()
        field.name = this.body.object_attributes.title
        field.value = (this.body.object_attributes.description !== null && this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + '\u2026' : this.body.object_attributes.description
        this.embed.fields = [ field ]
        this.addEmbed(this.embed)
    }

    public async note() {
        let type: string = null
        switch (this.body.object_attributes.noteable_type) {
            case 'Commit':
                type = 'commit (' + this.body.commit.id.substring(0, 7) + ')'
                break
            case 'MergeRequest':
                type = 'merge request #' + this.body.merge_request.iid
                break
            case 'Issue':
                type = 'issue #' + this.body.issue.iid
                break
            case 'Snippet':
                type = 'snippet #' + this.body.snippet.id
                break
        }
        this.embed.title = 'Wrote a comment on ' + type + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        this.embed.description = (this.body.object_attributes.note.length > 2048) ? this.body.object_attributes.note.substring(0, 2047) + '\u2026' : this.body.object_attributes.note
        this.addEmbed(this.embed)
    }

    public async mergeRequest() {
        const actions = {
            open: 'Opened',
            close: 'Closed',
            reopen: 'Reopened',
            update: 'Updated',
            merge: 'Merged'
        }
        const field = new EmbedField()
        field.name = this.body.object_attributes.title
        field.value = (this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + '\u2026' : this.body.object_attributes.description
        this.embed.title = actions[this.body.object_attributes.action] + ' merge request #' + this.body.object_attributes.iid + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        this.embed.fields = [ field ]
        this.addEmbed(this.embed)
    }

    public async wikiPage() {
        const actions = {
            create: 'Created',
            delete: 'Deleted',
            update: 'Updated'
        }

        this.embed.title = actions[this.body.object_attributes.action] + ' wiki page ' + this.body.object_attributes.title + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        this.embed.description = (typeof this.body.object_attributes.message !== 'undefined') ? (this.body.object_attributes.message.length > 2048) ? this.body.object_attributes.message.substring(0, 2047) + '\u2026' : this.body.object_attributes.message : ''
        this.addEmbed(this.embed)
    }

    public async pipeline() {
        this.embed.title = 'Pipeline #' + this.body.object_attributes.id + ' on ' + this.body.project.name
        this.embed.url = this.body.project.web_url + '/pipelines/' + this.body.object_attributes.id
        this.embed.author = this.authorFromBody()
        this.embed.description = '**Status**: ' + this.body.object_attributes.status
        this.addEmbed(this.embed)
    }

    public async build() {
        this.embed.title = 'Build #' + this.body.build_id + ' on ' + this.body.repository.name
        this.embed.url = this.body.repository.homepage + '/builds/' + this.body.build_id
        this.embed.author = this.authorFromBody()
        this.embed.description = '**Status**: ' + this.body.build_status
        this.addEmbed(this.embed)
    }

    private authorFromBody(): EmbedAuthor {
        const author = new EmbedAuthor()
        author.name = this.body.user.name
        author.iconUrl = GitLab._formatAvatarURL(this.body.user.avatar_url)
        return author
    }

    private authorFromBodyPush(): EmbedAuthor {
        const author = new EmbedAuthor()
        author.name = this.body.user_name
        author.iconUrl = GitLab._formatAvatarURL(this.body.user_avatar)
        return author
    }
}

export { GitLab }
