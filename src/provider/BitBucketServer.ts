import { Embed, EmbedField, EmbedAuthor } from '../model/DiscordApi'
import { TypeParseProvder } from './BaseProvider'

export class BitBucketServer extends TypeParseProvder {

    private embed: Embed

    private static _formatLargeString(str: string, limit = 256): string {
        return (str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str)
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

    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = {}
    }

    public getName(): string {
        return 'BitBucketServer'
    }

    public getType(): string | null {
        if (this.headers == null) {
            return null
        }
        return this.headers['x-event-key']
    }

    public knownTypes(): string[] {
        return [
            'diagnosticsPing',
            'repoRefsChanged',
            'repoModified',
            'repoForked',
            'repoCommentAdded',
            'repoCommentEdited',
            'repoCommentDeleted',
            'prOpened',
            'prFromRefUpdated',
            'prModified',
            'prReviewerUpdated',
            'prReviewerApproved',
            'prReviewerUnapproved',
            'prReviewerNeedsWork',
            'prMerged',
            'prDeclined',
            'prDeleted',
            'prCommentAdded',
            'prCommentEdited',
            'prCommentDeleted',
            'mirrorRepoSynchronized'
        ]
    }

    public async diagnosticsPing(): Promise<void> {
        this.embed.title = 'Test Connection'
        this.embed.description = 'You have successfully configured Skyhook with your BitBucket Server instance.'
        this.embed.fields = [{
            name: 'Test',
            value: this.body.test
        }]

        this.addEmbed(this.embed)
    }

    public async repoRefsChanged(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractRepoRepositoryName()}] New commit`
        this.embed.description = this.body.repository.description
        this.embed.url = this.extractRepoUrl()
        this.embed.fields = this.extractRepoChangesField()
        this.addEmbed(this.embed)
    }

    public async repoModified(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.body.old.name}] Repository has been updated`
        this.embed.url = this.extractBaseLink() + '/projects/' + this.body.new.project.key + '/repos/' + this.body.new.slug + '/browse'
        this.addEmbed(this.embed)
    }

    public async repoForked(): Promise<void> {
        this.embed.author = this.extractAuthor()
        this.embed.description = 'A new [`fork`] has been created.'
        this.addEmbed(this.embed)
    }

    public async repoCommentAdded(): Promise<void> {
        this.formatCommitCommentPayload('New comment on commit')
        this.addEmbed(this.embed)
    }

    public async repoCommentEdited(): Promise<void> {
        this.formatCommitCommentPayload('Comment edited on commit')
        this.addEmbed(this.embed)
    }

    public async repoCommentDeleted(): Promise<void> {
        this.formatCommitCommentPayload('Comment deleted on commit')
        this.addEmbed(this.embed)
    }

    public async prOpened(): Promise<void> {
        this.formatPrPayload('Pull request opened')
        this.addEmbed(this.embed)
    }

    public async prFromRefUpdated(): Promise<void> {
        this.formatPrPayload('Pull request updated')
        this.addEmbed(this.embed)
    }

    public async prModified(): Promise<void> {
        this.formatPrPayload('Pull request modified')
        this.addEmbed(this.embed)
    }

    public async prReviewerUpdated(): Promise<void> {
        this.formatPrPayload('New reviewers for pull request')
        this.addEmbed(this.embed)
    }

    public async prReviewerApproved(): Promise<void> {
        this.formatPrPayload('Pull request approved')
        this.addEmbed(this.embed)
    }

    public async prReviewerUnapproved(): Promise<void> {
        this.formatPrPayload(('Removed approval for pull request'))
        this.addEmbed(this.embed)
    }

    public async prReviewerNeedsWork(): Promise<void> {
        this.formatPrPayload('Pull request needs work')
        this.addEmbed(this.embed)
    }

    public async prMerged(): Promise<void> {
        this.formatPrPayload('Pull request merged')
        this.addEmbed(this.embed)
    }

    public async prDeclined(): Promise<void> {
        this.formatPrPayload('Pull request declined')
        this.addEmbed(this.embed)
    }

    public async prDeleted(): Promise<void> {
        this.formatPrPayload('Deleted pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentAdded(): Promise<void> {
        this.formatCommentPayload('New comment on pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentEdited(): Promise<void> {
        this.formatCommentPayload('Updated comment on pull request')
        this.addEmbed(this.embed)
    }

    public async prCommentDeleted(): Promise<void> {
        this.formatCommentPayload('Deleted comment on pull request')
        this.addEmbed(this.embed)
    }

    public async mirrorRepoSynchronized(): Promise<void> {
        this.embed.title = `[${this.extractRepoRepositoryName()}] Mirror Synchronized`
    }

    private formatPrPayload(title: string): void {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] ${title}: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.pullRequest.description
        this.embed.url = this.extractPullRequestUrl()
        this.embed.fields = this.extractPullRequestFields()
    }

    private formatCommentPayload(title: string): void {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractPullRequestRepositoryName()}] ${title}: #${this.body.pullRequest.id} ${this.body.pullRequest.title}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractPullRequestUrl()
    }

    private formatCommitCommentPayload(title: string): void {
        this.embed.author = this.extractAuthor()
        this.embed.title = `[${this.extractRepoRepositoryName()}] ${title} ${this.body.commit.slice(0, 10)}`
        this.embed.description = this.body.comment.text
        this.embed.url = this.extractCommitCommentUrl()
    }

    private extractAuthor(): EmbedAuthor {
        return {
            name: this.body.actor.displayName,
            icon_url: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png'
        }
    }

    private extractPullRequestUrl(): string {
        return this.extractBaseLink() + '/projects/' + this.body.pullRequest.fromRef.repository.project.key + '/repos/'
            + this.body.pullRequest.fromRef.repository.slug + '/pull-requests/' + this.body.pullRequest.id + '/overview'
    }

    private extractPullRequestFields(): EmbedField[] {
        const fieldArray: EmbedField[] = []

        fieldArray.push({
            name: 'From --> To',
            value: `**Source branch:** ${this.body.pullRequest.fromRef.displayId} \n **Destination branch:** ${this.body.pullRequest.toRef.displayId} \n **State:** ${this.body.pullRequest.state}`
        })

        for (let i = 0; i < Math.min(this.body.pullRequest.reviewers.length, 18); i++) {
            fieldArray.push({
                name: 'Reviewer',
                value: this.body.pullRequest.reviewers[i].user.displayName
            })
        }

        return fieldArray
    }

    private extractPullRequestRepositoryName(): string {
        return this.body.pullRequest.toRef.repository.name
    }

    private extractRepoRepositoryName(): string {
        return this.body.repository.name
    }

    private extractRepoUrl(): string {
        return this.extractBaseLink() + '/projects/' + this.body.repository.project.key + '/repos/' + this.body.repository.slug + '/browse'
    }

    private extractRepoChangesField(): EmbedField[] {
        const fieldArray: EmbedField[] = []

        for (let i = 0; i < Math.min(this.body.changes.length, 18); i++) {
            fieldArray.push({
                name: 'Change',
                value: `**Branch:** ${this.body.changes[i].ref.displayId} \n **Old Hash:** ${this.body.changes[i].fromHash.slice(0, 10)} \n **New Hash:** ${this.body.changes[i].toHash.slice(0, 10)} \n **Type:** ${this.body.changes[i].type}`
            })
        }

        return fieldArray
    }

    private extractCommitCommentUrl(): string {
        return this.extractBaseLink() + '/projects/' + this.body.repository.project.key + '/repos/' + this.body.repository.slug + '/commits/' + this.body.commit
    }

    private extractBaseLink(): string {
        const actorLink = this.body.actor.links.self[0].href
        return actorLink.substring(0, actorLink.indexOf('/user'))
    }
}
