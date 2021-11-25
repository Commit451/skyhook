import { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi'
import { TypeParseProvder } from '../provider/BaseProvider'

/**
 * https://docs.microsoft.com/en-us/vsts/service-hooks/create-subscription
 */
export class VSTS extends TypeParseProvder {

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0x68217a)
        this.embed = {}
    }

    public getName(): string {
        return 'VSTS'
    }

    public getType(): string {
        return this.body.eventType
    }

    // PUSH
    public async gitPush(): Promise<void> {
        const fields: EmbedField[] = []
        this.body.resource.commits.forEach((commit: { commitId: string, comment: string }) => {
            fields.push({
                name: 'Commit from ' + this.body.resource.pushedBy.displayName,
                value: '([`' + commit.commitId.substring(0, 7) + '`](' + this.body.resource.repository.remoteUrl + '/commit/' + commit.commitId + ')) ' + commit.comment,
                inline: false
            })
        })
        this.embed.fields = fields
        this.embed.author = {
            name: this.body.resource.pushedBy.displayName,
            icon_url: this.body.resource.pushedBy.imageUrl
        }
        this.addMinimalMessage()
    }

    // CHECK IN
    public async tfvcCheckin(): Promise<void> {
        this.embed.fields = [{
            name: 'Check in from ' + this.body.resource.checkedInBy.displayName,
            value: '([`' + this.body.resource.changesetId + '`](' + this.body.resource.url + ')) ' + this.body.resource.comment,
            inline: false
        }]
        this.addMinimalMessage()
    }

    // PULL REQUEST
    public async gitPullrequestCreated(): Promise<void> {
        this.embed.author = this.extractCreatedByAuthor()
        this.embed.fields = [{
            name: 'Pull Request from ' + this.body.resource.createdBy.displayName,
            value: '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description,
            inline: false
        }]
        this.addMinimalMessage()
    }

    // PULL REQUEST MERGE COMMIT
    public async gitPullrequestMerged(): Promise<void> {
        this.embed.author = this.extractCreatedByAuthor()
        this.embed.fields = [{
            name: 'Pull Request Merge Commit from ' + this.body.resource.createdBy.displayName,
            value: '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description,
            inline: false
        }]
        this.addMinimalMessage()
    }

    // PULL REQUEST UPDATED
    public async gitPullrequestUpdated(): Promise<void> {
        this.embed.author = this.extractCreatedByAuthor()
        this.embed.fields = [{
            name: 'Pull Request Updated by ' + this.body.resource.createdBy.displayName,
            value: '([`' + this.body.resource.title + '`](' + this.body.resource.repository.remoteUrl + ')) ' + this.body.resource.description,
            inline: false
        }]
        this.addMinimalMessage()
    }

    // WORK ITEM COMMENTED ON
    public async workitemCommented(): Promise<void> {
        this.addMinimalMessage()
    }

    // WORK ITEM CREATED
    public async workitemCreated(): Promise<void> {
        this.addMinimalMessage()
    }

    // WORK ITEM DELETED
    public async workitemDeleted(): Promise<void> {
        this.addMinimalMessage()
    }

    // WORK ITEM RESTORED
    public async workitemRestored(): Promise<void> {
        this.addMinimalMessage()
    }

    // WORK ITEM UPDATED
    public async workitemUpdated(): Promise<void> {
        this.addMinimalMessage()
    }

    // BUILD COMPLETED
    public async buildComplete(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE CREATED
    public async msVssReleaseReleaseCreatedEvent(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE ABANDONED
    public async msVssReleaseReleaseAbandonedEvent(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT APPROVAL COMPLETED
    public async msVssReleaseDeploymentApprovalCompleted(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT APPROVAL PENDING
    public async msVssReleaseDeploymentApprovalPendingEvent(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT COMPLETED
    public async msVssReleaseDeploymentCompletedEvent(): Promise<void> {
        this.addMinimalMessage()
    }

    // RELEASE DEPLOYMENT STARTED
    public async msVssReleaseDeplyomentStartedEvent(): Promise<void> {
        this.addMinimalMessage()
    }

    // Because carpal tunnel...
    private addMinimalMessage(): void {
        this.embed.title = this.body.message.markdown as string

        if (this.embed.title.length > 256) {
            this.embed.title = this.body.resource.title ?? this.body.message.markdown.substring(0, 256)
        }

        this.addEmbed(this.embed)
    }

    private extractCreatedByAuthor(): EmbedAuthor {
        return {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl
        }
    }
}
