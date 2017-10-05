// vsts.js
// https://docs.microsoft.com/en-us/vsts/service-hooks/create-subscription
// ========

const BaseProvider = require('../util/BaseProvider');

class VSTS extends BaseProvider {
	constructor() {
		super();
		this.payload.setEmbedColor(0x205081);
		this.baseLink = 'https://www.visualstudio.com/team-services/';
		this.thumbnail = {
			url: 'http://jeroenniesen.com/wp-content/uploads/2016/11/visual_studio_2012_logo.png',
			height: 150,
			width: 150
		};
	}

	static getName() {
		return 'VSTS';
	}

	async getType() {
		return this.body.eventType;
	}

	addtMinimalMessage() {
		this.payload.addEmbed({
			title: this.body.message.markdown,
			url: this.body.resource.url,
			thumbnail: this.thumbnail
		});
	}

	// *************** CODE *************** 

	//PUSH
	async gitPush() {
		this.addtMinimalMessage();
	}

	//CHECK IN
	async tfvcCheckin() {
		this.addtMinimalMessage();
	}

	//PULL REQUEST
	async gitPullrequestCreated() {
		this.addtMinimalMessage();
	}

	//PULL REQUEST MERGE COMMIT
	async gitPullrequestMerged() {
		this.addtMinimalMessage();
	}

	//PULL REQUEST UPDATED
	async gitPullrequestUpdated() {
		this.addtMinimalMessage();
	}

	// *************** WORK ITEMS *************** 

	//WORK ITEM COMMENTED ON
	async workitemCommented() {
		this.addtMinimalMessage();
	}

	//WORK ITEM CREATED
	async workitemCreated() {
		this.addMinimalMessage();
	}

	//WORK ITEM DELETED
	async workitemDeleted() {
		this.addtMinimalMessage();
	}

	//WORK ITEM RESTORED
	async workitemRestored() {
		this.addtMinimalMessage();
	}

	//WORK ITEM UPDATED
	async workitemUpdated() {
		this.addtMinimalMessage();
	}

	// *************** BUILD AND RELEASE *************** 

	//BUILD COMPLETED
	async buildComplete() {
		this.addtMinimalMessage();
	}

	//RELEASE CREATED
	async msVssReleaseReleaseCreatedEvent() {
		this.addtMinimalMessage();
	}
	//RELEASE ABANDONED
	

	//RELEASE DEPLOYMENT APPROVAL COMPLETED
	async msVssReleaseDeploymentApprovalCompleted() {
		this.addtMinimalMessage();
	}

	//RELEASE DEPLOYMENT APPROVAL PENDING
	async msVssReleaseDeploymentApprovalPendingEvent() {
		this.addtMinimalMessage();
	}

	//RELEASE DEPLOYMENT COMPLETED
	async msVssReleaseDeploymentCompletedEvent() {
		this.addtMinimalMessage();
	}

	//RELEASE DEPLOYMENT STARTED
	async msVssReleaseDeplyomentStartedEvent() {
		this.addtMinimalMessage();
	}
}

module.exports = VSTS;