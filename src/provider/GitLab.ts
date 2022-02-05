import { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi'
import { TypeParseProvder } from '../provider/BaseProvider'

interface Project {
    name: string
    url: string
    branch: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commits: any[]
    totalCommitsCount: number
}

/**
 * https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
 */
export class GitLab extends TypeParseProvder {

    private static _formatAvatarURL(url: string): string {
        if (!/^https?:\/\/|^\/\//i.test(url)) {
            return 'https://gitlab.com' + url
        }
        return url
    }

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0xFCA326)
        this.embed = {}
    }

    public getName(): string {
        return 'GitLab'
    }

    public getType(): string | null {
        return this.body.object_kind
    }

    public knownTypes(): string[] {
        return [
            'push',
            'tagPush',
            'issue',
            'note',
            'mergeRequest',
            'wikiPage',
            'pipeline',
            'build'
        ]
    }

    public async push(): Promise<void> {
        const branch = this.body.ref.split('/')
        branch.shift()
        branch.shift()

        const project = this.projectFromBody()

        if (project.totalCommitsCount > 0) {
            const fields: EmbedField[] = []

            for (const commit of project.commits) {
                const message = (commit.message.length > 256) ? commit.message.substring(0, 255) + '\u2026' : commit.message
                fields.push({
                    name: 'Commit from ' + commit.author.name,
                    value: '(' + '[`' + commit.id.substring(0, 7) + '`](' + commit.url + ')' + ') ' + (message == null ? '' : message.replace(/\n/g, ' ').replace(/\r/g, ' ')),
                    inline: false
                })
            }

            this.embed.title = '[' + project.name + ':' + project.branch + '] ' + project.totalCommitsCount + ' commit' + ((project.totalCommitsCount > 1) ? 's' : '')
            this.embed.url = project.url + '/tree/' + project.branch
            this.embed.fields = fields
        } else {
            if (this.body.after !== '0000000000000000000000000000000000000000') {
                this.embed.title = '[' + project.name + ':' + project.branch + '] New branch created: ' + project.branch
                this.embed.url = project.url + '/tree/' + project.branch
            } else {
                this.embed.title = '[' + project.name + ':' + project.branch + '] Branch deleted: ' + project.branch
                this.embed.url = project.url
            }
        }

        this.embed.author = this.authorFromBodyPush()
        this.addEmbed(this.embed)
    }

    public async tagPush(): Promise<void> {
        const tmpTag = this.body.ref.split('/')
        tmpTag.shift()
        tmpTag.shift()
        const tag = tmpTag.join('/')

        const project = this.projectFromBody()

        this.embed.url = project.url + '/tags/' + tag
        this.embed.author = this.authorFromBodyPush()
        this.embed.description = (this.body.message != null) ? ((this.body.message.length > 1024) ? this.body.message.substring(0, 1023) + '\u2026' : this.body.message) : ''
        if (this.body.after !== '0000000000000000000000000000000000000000') {
            this.embed.title = `Pushed tag "${tag}" to ${project.name}`
        } else {
            this.embed.title = `Deleted tag "${tag}" to ${project.name}`
        }
        this.addEmbed(this.embed)
    }

    public async issue(): Promise<void> {
        const actions: Record<string, string> = {
            open: 'Opened',
            close: 'Closed',
            reopen: 'Reopened',
            update: 'Updated'
        }

        this.embed.title = actions[this.body.object_attributes.action] + ' issue #' + this.body.object_attributes.iid + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        if (this.body.object_attributes.description !== '') {
            this.embed.fields = [{
                name: this.body.object_attributes.title,
                value: (this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + '\u2026' : this.body.object_attributes.description
            }]
        } else {
            this.embed.description = `**${this.body.object_attributes.title}**`
        }
        this.addEmbed(this.embed)
    }

    public async note(): Promise<void> {
        let type: string
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
            default:
                type = 'unknown'
                break
        }
        this.embed.title = 'Wrote a comment on ' + type + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        this.embed.description = (this.body.object_attributes.note.length > 2048) ? this.body.object_attributes.note.substring(0, 2047) + '\u2026' : this.body.object_attributes.note
        this.addEmbed(this.embed)
    }

    public async mergeRequest(): Promise<void> {
        const actions: Record<string, string> = {
            open: 'Opened',
            close: 'Closed',
            reopen: 'Reopened',
            update: 'Updated',
            merge: 'Merged',
            approved: 'Approved',
            unapproved: 'Unapproved'
        }
        this.embed.title = actions[this.body.object_attributes.action] + ' merge request #' + this.body.object_attributes.iid + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        if (this.body.object_attributes.description !== '') {
            this.embed.fields = [{
                name: this.body.object_attributes.title,
                value: (this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + '\u2026' : this.body.object_attributes.description
            }]
        } else {
            this.embed.description = `**${this.body.object_attributes.title}**`
        }
        this.addEmbed(this.embed)
    }

    public async wikiPage(): Promise<void> {
        const actions: Record<string, string> = {
            create: 'Created',
            delete: 'Deleted',
            update: 'Updated'
        }

        this.embed.title = actions[this.body.object_attributes.action] + ' wiki page ' + this.body.object_attributes.title + ' on ' + this.body.project.name
        this.embed.url = this.body.object_attributes.url
        this.embed.author = this.authorFromBody()
        this.embed.description = (this.body.object_attributes.message != null) ? (this.body.object_attributes.message.length > 2048) ? this.body.object_attributes.message.substring(0, 2047) + '\u2026' : this.body.object_attributes.message : ''
        this.addEmbed(this.embed)
    }

    public async pipeline(): Promise<void> {
        this.embed.title = 'Pipeline #' + this.body.object_attributes.id + ' on ' + this.body.project.name
        this.embed.url = this.body.project.web_url + '/pipelines/' + this.body.object_attributes.id
        this.embed.author = this.authorFromBody()
        this.embed.description = '**Status**: ' + this.body.object_attributes.status
        this.addEmbed(this.embed)
    }

    public async build(): Promise<void> {
        // The build event uses the deprecated repository field.
        const realProj = this.body.project || this.body.repository
        this.embed.title = 'Build #' + this.body.build_id + ' on ' + realProj.name
        this.embed.url = realProj.homepage + '/builds/' + this.body.build_id
        this.embed.author = this.authorFromBody()
        this.embed.description = '**Status**: ' + this.body.build_status
        this.addEmbed(this.embed)
    }

    private authorFromBody(): EmbedAuthor {
        return {
            name: this.body.user.name,
            icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
        }
    }

    private authorFromBodyPush(): EmbedAuthor {
        return {
            name: this.body.user_name,
            icon_url: GitLab._formatAvatarURL(this.body.user_avatar)
        }
    }

    private projectFromBody(): Project {
        const branch = this.body.ref.split('/')
        branch.shift()
        branch.shift()

        if (this.body.project != null) {
            return {
                name: this.body.project.name,
                url: this.body.project.web_url,
                branch: branch.join('/'),
                commits: this.body.commits || [],
                totalCommitsCount: this.body.total_commits_count || 0,
            }

        } else if (this.body.repository != null) {
            return {
                name: this.body.repository.name,
                url: this.body.repository.homepage,
                branch: branch.join('/'),
                commits: this.body.commits || [],
                totalCommitsCount: this.body.total_commits_count || 0
            }
        }

        throw new Error('Failed to resolve project from body! Did GitLab\'s webhook format change?')
    }
}
