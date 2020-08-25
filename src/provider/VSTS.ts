import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://docs.microsoft.com/en-us/vsts/service-hooks/create-subscription
 */
class VSTS extends BaseProvider {

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0x68217a)
        this.embed = new Embed()
    }

    public getName() {
        return 'VSTS'
    }

    public getType(): string {
        return this.body.eventType
    }

    // PUSH
    public async gitPush() {
        const author = new EmbedAuthor()
        author.name = this.body.resource.pushedBy.displayName
        author.icon_url = this.body.resource.pushedBy.imageUrl
        const fields: EmbedField[] = []
        this.body.resource.commits.forEach((commit: any) => {
            const field = new EmbedField()
            field.name = 'Commit from ' + this.body.resource.pushedBy.displayName
            field.value = '([`' + commit.commitId.substring(0, 7) + '`](' + this.body.resource.repository.remoteUrl + '/commit/' + commit.commitId + ')) ' + commit.comment
            field.inline = false
            fields.push(field)
        })
        this.embed.fields = fields
        this.embed.author = author
        this.addMinimalMessage()
    }

    // CHECK IN
    public async tfvcCheckin() {
        const name = this.body.resource.checkedInBy.displayName
        const field = new EmbedField()
        field.name = 'Check in from ' + name
        field.value = '([`' + this.body.resource.changesetId + '`](' + this.body.resource.url + ')) ' + this.body.resource.comment
        field.inline = false
        this.embed.fields = [field]
        this.addMinimalMessage()
    }

    // PULL REQUEST
    public async gitPullrequestCreated() {
        const author = this.extractCreatedByAuthor()
        this.embed.author = author
        const field = new EmbedField()
        field.name = 'Pull Request from ' + this.body.resource.createdBy.displayName
        field.value = '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description
        field.inline = false
        this.embed.fields = [field]
        this.addMinimalMessage()
    }

    // PULL REQUEST MERGE COMMIT
    public async gitPullrequestMerged() {
        const author = this.extractCreatedByAuthor()
        this.embed.author = author
        const field = new EmbedField()
        field.name = 'Pull Request Merge Commit from ' + this.body.resource.createdBy.displayName
        field.value = '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description
        field.inline = false
        this.embed.fields = [field]
        this.addMinimalMessage()
    }

    // PULL REQUEST UPDATED
    public async gitPullrequestUpdated() {
        const author = this.extractCreatedByAuthor()
        this.embed.author = author
        const field = new EmbedField()
        field.name = 'Pull Request Updated by ' + this.body.resource.createdBy.displayName
        field.value = '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description
        field.inline = false
        this.embed.fields = [field]
        this.addMinimalMessage()
    }

    // WORK ITEM COMMENTED ON
    public async workitemCommented() {
        this.addMinimalMessage()
    }

    // WORK ITEM CREATED
    public async workitemCreated() {
        this.addMinimalMessage()
    }

    // WORK ITEM DELETED
    public async workitemDeleted() {
        this.addMinimalMessage()
    }

    // WORK ITEM RESTORED
    public async workitemRestored() {
        this.addMinimalMessage()
    }

    // WORK ITEM UPDATED
    public async workitemUpdated() {
        this.addMinimalMessage()
    }

    // BUILD COMPLETED
    public async buildComplete() {
        this.addMinimalMessage()
    }

    // RELEASE CREATED
    public async msVssReleaseReleaseCreatedEvent() {
        this.addMinimalMessage()
    }

    // RELEASE ABANDONED
    public async msVssReleaseReleaseAbandonedEvent() {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT APPROVAL COMPLETED
    public async msVssReleaseDeploymentApprovalCompleted() {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT APPROVAL PENDING
    public async msVssReleaseDeploymentApprovalPendingEvent() {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT COMPLETED
    public async msVssReleaseDeploymentCompletedEvent() {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT STARTED
    public async msVssReleaseDeplyomentStartedEvent() {
        this.addMinimalMessage()
    }

    // Because carpal tunnel...
    private addMinimalMessage() {
        this.embed.title = this.body.message.markdown
		
		if (this.embed.title.length > 256)
			this.embed.title = this.body.resource.title ?? this.body.message.markdown.substring(0, 256);
		
        this.addEmbed(this.embed)
    }

    private extractCreatedByAuthor(): EmbedAuthor {
        const author = new EmbedAuthor()
        author.name = this.body.resource.createdBy.displayName
        author.icon_url = this.body.resource.createdBy.imageUrl
        return author
    }
}

export { VSTS }
