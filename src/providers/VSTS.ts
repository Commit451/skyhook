import { BaseProvider } from "../util/BaseProvider"

/**
 * https://docs.microsoft.com/en-us/vsts/service-hooks/create-subscription
 */
class VSTS extends BaseProvider {

    public static getName() {
        return 'VSTS'
    }

    constructor() {
        super()
        this.payload.setEmbedColor(0x68217a)
        this.fields = []
    }

    public async getType() {
        return this.body.eventType
    }

    // PUSH
    public async gitPush() {
        this.user = {
            name: this.body.resource.pushedBy.displayName,
            icon_url: this.body.resource.pushedBy.imageUrl
        }
        for (let i = 0; i < this.body.resource.commits.length; i++) {
            const commit = this.body.resource.commits[i]
            this.fields.push({
                name: "Commit from " + this.body.resource.pushedBy.displayName,
                value: "([`" + commit.commitId.substring(0, 7) + "`](" +
                    this.body.resource.repository.remoteUrl + "/commit/" + commit.commitId + ")) " + commit.comment,
                inline: false,
            })
        }
        this.addMinimalMessage()
    }

    // CHECK IN
    public async tfvcCheckin() {
        const name = this.body.resource.checkedInBy.displayName
        this.payload.getData().fields.push({
            name: "Check in from " + this.user.name,
            value: "([`" + this.body.resource.changesetId + "`](" +
                this.body.resource.url + ")) " + this.body.resource.comment,
            inline: false,
        })
        this.addMinimalMessage()
    }

    // PULL REQUEST
    public async gitPullrequestCreated() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl,
        }
        this.fields.push({
            name: "Pull Request from " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
                this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false,
        })
        this.addMinimalMessage()
    }

    // PULL REQUEST MERGE COMMIT
    public async gitPullrequestMerged() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl,
        }
        this.fields.push({
            name: "Pull Request Merge Commit from " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
                this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false,
        })
        this.addMinimalMessage()
    }

    // PULL REQUEST UPDATED
    public async gitPullrequestUpdated() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl,
        }
        this.fields.push({
            name: "Pull Request Updated by " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
                this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false,
        })
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
        this.payload.addEmbed({
            title: this.body.message.markdown,
            author: this.user,
            thumbnail: this.thumbnail,
            fields: this.fields,
        })
    }
}

export { VSTS }
