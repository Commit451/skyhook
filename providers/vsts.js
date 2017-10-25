// vsts.js
// https://docs.microsoft.com/en-us/vsts/service-hooks/create-subscription
// ========

const BaseProvider = require('../util/BaseProvider');

class VSTS extends BaseProvider {
    constructor() {
        super();
        this.payload.setEmbedColor(0x68217a);
        this.thumbnail = {
            url: 'http://jeroenniesen.com/wp-content/uploads/2016/11/visual_studio_2012_logo.png',
            height: 150,
            width: 150
        };
        this.fields = [];
        this.user;
    }

    static getName() {
        return 'VSTS';
    }

    async getType() {
        return this.body.eventType;
    }

    // Because carpal tunnel...
    addMinimalMessage() {
        this.payload.addEmbed({
            title: this.body.message.markdown,
            author: this.user,
            thumbnail: this.thumbnail,
            fields: this.fields
        });
    }

    // *************** CODE *************** 

    //PUSH
    async gitPush() {
        this.user = {
            name: this.body.resource.pushedBy.displayName,
            icon_url: this.body.resource.pushedBy.imageUrl
        };
        for (let i = 0; i < this.body.resource.commits.length; i++) {
            let commit = this.body.resource.commits[i];
            this.fields.push({
                name: "Commit from " + this.body.resource.pushedBy.displayName,
                value: "([`" + commit.commitId.substring(0, 7) + "`](" +
                this.body.resource.repository.remoteUrl + "/commit/" + commit.commitId + ")) " + commit.comment,
                inline: false
            });
        }
        this.addMinimalMessage();
    }

    //CHECK IN
    async tfvcCheckin() {
        this.user = {
            name: this.body.resource.checkedInBy.displayName,
            icon_url: this.body.resource.checkedInBy.imageUrl
        };
        this.fields.push({
            name: "Check in from " + this.user.name,
            value: "([`" + this.body.resource.changesetId + "`](" +
            this.body.resource.url + ")) " + this.body.resource.comment,
            inline: false
        });
        this.addMinimalMessage();
    }

    //PULL REQUEST
    async gitPullrequestCreated() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl
        };
        this.fields.push({
            name: "Pull Request from " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
            this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false
        });
        this.addMinimalMessage();
    }

    //PULL REQUEST MERGE COMMIT
    async gitPullrequestMerged() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl
        };
        this.fields.push({
            name: "Pull Request Merge Commit from " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
            this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false
        });
        this.addMinimalMessage();
    }

    //PULL REQUEST UPDATED
    async gitPullrequestUpdated() {
        this.user = {
            name: this.body.resource.createdBy.displayName,
            icon_url: this.body.resource.createdBy.imageUrl
        };
        this.fields.push({
            name: "Pull Request Updated by " + this.body.resource.createdBy.displayName,
            value: "([`" + this.body.resource.title + "`](" +
            this.body.resource.repository.remoteUrl + ")) " + this.body.resource.description,
            inline: false
        });
        this.addMinimalMessage();
    }

    // *************** WORK ITEMS *************** 

    //WORK ITEM COMMENTED ON
    async workitemCommented() {
        this.addMinimalMessage();
    }

    //WORK ITEM CREATED
    async workitemCreated() {
        this.addMinimalMessage();
    }

    //WORK ITEM DELETED
    async workitemDeleted() {
        this.addMinimalMessage();
    }

    //WORK ITEM RESTORED
    async workitemRestored() {
        this.addMinimalMessage();
    }

    //WORK ITEM UPDATED
    async workitemUpdated() {
        this.addMinimalMessage();
    }

    // *************** BUILD AND RELEASE *************** 

    //BUILD COMPLETED
    async buildComplete() {
        this.addMinimalMessage();
    }

    //RELEASE CREATED
    async msVssReleaseReleaseCreatedEvent() {
        this.addMinimalMessage();
    }

    //RELEASE ABANDONED
    async msVssReleaseReleaseAbandonedEvent() {
        this.addMinimalMessage();
    }

    //RELEASE DEPLOYMENT APPROVAL COMPLETED
    async msVssReleaseDeploymentApprovalCompleted() {
        this.addMinimalMessage();
    }

    //RELEASE DEPLOYMENT APPROVAL PENDING
    async msVssReleaseDeploymentApprovalPendingEvent() {
        this.addMinimalMessage();
    }

    //RELEASE DEPLOYMENT COMPLETED
    async msVssReleaseDeploymentCompletedEvent() {
        this.addMinimalMessage();
    }

    //RELEASE DEPLOYMENT STARTED
    async msVssReleaseDeplyomentStartedEvent() {
        this.addMinimalMessage();
    }
}

module.exports = VSTS;