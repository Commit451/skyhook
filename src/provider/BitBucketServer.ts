import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from './BaseProvider'

class BitBucketServer extends BaseProvider {
    private embed: Embed

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
        field.name = 'Test'
        field.value = this.body.test
        this.embed.fields = [field]

        this.addEmbed(this.embed)
    }

    public async repoRefsChanged() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractRepoRepositoryName()}] New commit`
        this.embed.description = this.body.repository.description
        this.embed.url = this.extractRepoUrl()
        this.embed.fields = this.extractRepoChangesField()
        this.addEmbed(this.embed)
    }

    public async repoModified() {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.old.name}] Repository has been updated`
        this.embed.url = this.extractBaseLink() + '/projects/' + this.body.new.project.key + '/repos/' + this.body.new.slug + '/browse'
        this.addEmbed(this.embed)
    }

    public async repoForked() {
        this.embed.author = this.extractAuthor()
        this.embed.description = 'A new [`fork`] has been created.'
        this.addEmbed(this.embed)
    }

    public async repoCommentAdded() {
        this.formatCommitCommentPayload('New comment no commit')
        this.addEmbed(this.embed)
    }

    public async repoCommentEdited() {
        this.formatCommitCommentPayload('Comment edited on commit')
        this.addEmbed(this.embed)
    }

    public async repoCommentDeleted() {
        this.formatCommitCommentPayload('Comment deleted on commit')
        this.addEmbed(this.embed)
    }

    public async prOpened() {
        this.formatPrPayload('Pull request opened')
        this.addEmbed(this.embed)
    }

    public async prFromRefUpdated() {
        this.formatPrPayload('Pull request updated')
        this.addEmbed(this.embed)
    }

    public async prModified() {
        this.formatPrPayload('Pull request modified')
        this.addEmbed(this.embed)
    }

    public async prReviewerUpdated() {
        this.formatPrPayload('New reviewers for pull request')
        this.addEmbed(this.embed)
    }

    public async prReviewerApproved() {
        this.formatPrPayload('Pull request approved')
        this.addEmbed(this.embed)
    }

    public async prReviewerUnapproved() {
        this.formatPrPayload(('Removed approval for pull request'))
        this.addEmbed(this.embed)
    }

    public async prReviewerNeedsWork() {
        this.formatPrPayload('Pull request needs work')
        this.addEmbed(this.embed)
    }

    public async prMerged() {
        this.formatPrPayload('Pull request merged')
        this.addEmbed(this.embed)
    }

    public async prDeclined() {
        this.formatPrPayload('Pull request declined')
        this.addEmbed(this.embed)
    }

    public async prDeleted() {
        this.formatPrPayload('Deleted pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentAdded() {
        this.formatCommentPayload('New comment on pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentEdited() {
        this.formatCommentPayload('Updated comment on pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentDeleted() {
        this.formatCommentPayload('Deleted comment on pull request')
        this.addEmbed(this.embed)
    }

    public async mirrorRepoSynchronized() {
        this.embed.title = `[${this.extractRepoRepositoryName()}] Mirror Synchronized`
    }

    private formatPrPayload(title: string) {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] ${title}: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.pullRequest.description
        this.embed.url = this.extractPullRequestUrl()
        this.embed.fields = this.extractPullRequestFields()
    }

    private formatCommentPayload(title: string) {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] ${title}: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractPullRequestUrl()
    }

    private formatCommitCommentPayload(title: string) {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractRepoRepositoryName()}] New comment on commit ${this.body.commit.slice(0, 10)}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractCommitCommentUrl()
    }

    private extractAuthor(): EmbedAuthor {
        const author = new EmbedAuthor()
        author.name = this.body.actor.displayName
        author.icon_url = 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png'
        return author
    }

    private extractPullRequestUrl() {
        return this.extractBaseLink() + '/projects/' + this.body.pullRequest.fromRef.repository.project.key + '/repos/'
            + this.body.pullRequest.fromRef.repository.slug + '/pull-requests/' + this.body.pullRequest.id + '/overview'
    }

    private extractPullRequestFields(): EmbedField[] {
        const fieldArray = new Array<EmbedField>()

        const toFromRefField = new EmbedField()
        toFromRefField.name = 'From --> To'
        toFromRefField.value = `**Source branch:** ${this.body.pullRequest.fromRef.displayId} \n **Destination branch:** ${this.body.pullRequest.toRef.displayId} \n **State:** ${this.body.pullRequest.state}`
        fieldArray.push(toFromRefField)

        for (let i = 0; i < Math.min(this.body.pullRequest.reviewers.length, 18); i++) {
            const reviewerField = new EmbedField()
            reviewerField.name = 'Reviewer'
            reviewerField.value = this.body.pullRequest.reviewers[i].user.displayName
            fieldArray.push(reviewerField)
        }

        return fieldArray
    }

    private extractPullRequestRepositoryName(): string {
        return this.body.pullRequest.toRef.repository.name
    }

    private extractRepoRepositoryName(): string {
        return this.body.repository.name
    }

    private extractRepoUrl() {
        return this.extractBaseLink() + '/projects/' + this.body.repository.project.key + '/repos/' + this.body.repository.slug + '/browse'
    }

    private extractRepoChangesField(): EmbedField[] {
        const fieldArray = new Array<EmbedField>()

        for (let i = 0; i < Math.min(this.body.changes.length, 18); i++) {
            const changesEmbed = new EmbedField()
            changesEmbed.name = 'Change'
            changesEmbed.value = `**Branch:** ${this.body.changes[i].ref.displayId} \n **Old Hash:** ${this.body.changes[i].fromHash.slice(0, 10)} \n **New Hash:** ${this.body.changes[i].toHash.slice(0, 10)} \n **Type:** ${this.body.changes[i].type}`
            fieldArray.push(changesEmbed)
        }

        return fieldArray
    }

    private extractCommitCommentUrl() {
        return this.extractBaseLink() + '/projects/' + this.body.repository.project.key + '/repos/' + this.body.repository.slug + '/commits/' + this.body.commit
    }

    private extractBaseLink() {
        const actorLink = this.body.actor.links.self[0].href
        return actorLink.substring(0, actorLink.indexOf('/user'))
    }
}

export { BitBucketServer }