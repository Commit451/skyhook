import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from './BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'
import moment from 'moment'

class BitBucketServer extends BaseProvider {
    private embed: Embed
    private baseLink: string = this.extractBitbucketUrl()

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
        const strArray = str.toLowerCase().split(' ')
        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].slice(1)
        }
        return strArray.join(' ')
    }

    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = new Embed()
    }

    public getName() {
        return 'BitBucketServer'
    }

    public getType(): string {
        return this.headers['x-event-key']
    }

    public async diagnosticsPing() {
        const field = new EmbedField()
        this.embed.title = 'Test Connection'
        this.embed.description = `You have successfully configured Skyhook with your BitBucket Server instance.`
        field.name =  'Test'
        field.value = this.body.test
        this.embed.fields = [field]

        this.addEmbed(this.embed)
    }

    public async prOpened() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] Pull request opened: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.pullRequest.description
        this.embed.url = this.extractPullRequestUrl()
        this.embed.fields = this.extractPullRequestFields()
        this.addEmbed(this.embed)
    }

    public async prDeleted() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] Deleted pull request: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.addEmbed(this.embed)
    }

    public async prCommentAdded() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] New comment on pull request: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    public async prCommentEdited() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] Updated comment on pull request: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    public async prCommentDeleted() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] Deleted comment on pull request: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractPullRequestUrl()
        this.addEmbed(this.embed)
    }

    private extractBitbucketUrl(): string {
        return process.env.SERVER
    }

    private extractAuthor(): EmbedAuthor {
        const author = new EmbedAuthor()
        author.name = this.body.actor.displayName
        author.iconUrl = 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png'
        return author
    }

    private extractPullRequestUrl() {
        return this.baseLink + '/projects/' + this.body.pullRequest.fromRef.repository.project.key + '/repos/'
            + this.body.pullRequest.fromRef.repository.slug + '/pull-requests/' + this.body.pullRequest.id + '/overview'
    }

    private extractPullRequestFields(): EmbedField[] {
        const fieldArray = new Array<EmbedField>()

        const toFromRefField = new EmbedField()
        toFromRefField.name = 'From --> To'
        toFromRefField.value = `**Source branch:** ${this.body.pullRequest.fromRef.displayId} \n **Destination branch:** ${this.body.pullRequest.toRef.displayId} \n **State:** ${this.body.pullRequest.state}`
        fieldArray.push(toFromRefField)

        this.body.pullRequest.reviewers.forEach((reviewer) => {
            const reviewerField = new EmbedField()
            reviewerField.name = 'Reviewer'
            reviewerField.value = reviewer.user.displayName
            fieldArray.push(reviewerField)
        })

        return fieldArray
    }

    private extractPullRequestRepositoryName(): string {
        return this.body.pullRequest.toRef.repository.name
    }
}

export { BitBucketServer }