// bitbucket.js
// https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
// ========
const BaseProvider = require('../util/BaseProvider');

class BitBucket extends BaseProvider {
    constructor(){
        super();
        this.payload.setEmbedColor(0x205081);
        this.baseLink = 'https://bitbucket.org/';
    }

    async getType(){
        return this.req.get('X-Event-Key');
    }

    async repoPush(){
        let project = {
            name: this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name,
            branch: null,
            commits: null
        };
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };
        for (let i = 0; (i < this.body.push.changes.length && i <4); i++) {
            let change = this.body.push.changes[i];
            project.branch = (change.old !== null) ? change.old.name : change.new.name;
            project.commits = change.commits;

            let commits = [];
            for (let j = 0; j < project.commits.length; j++) {
                let commit = project.commits[j];
                let message = (commit.message.length > 256) ? commit.message.substring(0, 255) + "\u2026" : commit.message;
                let author = (typeof commit.author.user !== "undefined") ? commit.author.user.display_name : "Unknown";

                commits.push({
                    name: "Commit from " + author,
                    value: "(" + "[`" + commit.hash.substring(0, 7) + "`](" + commit.links.html.href + ")" + ") " + message.replace(/\n/g, " ").replace(/\r/g, " "),
                    inline: false
                });
            }

            this.payload.addEmbed({
                title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                url: project.url,
                author: user,
                fields: commits
            });
        }
    }

    async repoFork(){
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };
        this.payload.addEmbed({
            author: user,
            description: "Created a [`fork`](" + this.baseLink + this.body.fork.full_name + ") of [`" + this.body.repository.name + "`](" + this.baseLink + this.body.repository.full_name + ")"
        });
    }

    async repoUpdated(){
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        let changes = [];
        if (typeof this.body.changes.name !== "undefined") {
            changes.push("**Name:** \"" + this.body.changes.name.old + "\" -> \"" + this.body.changes.name.new + "\"");
        }
        if (typeof this.body.changes.website !== "undefined") {
            changes.push("**Website:** \"" + this.body.changes.website.old + "\" -> \"" + this.body.changes.website.new + "\"");
        }
        if (typeof this.body.changes.language !== "undefined") {
            changes.push("**Language:** \"" + this.body.changes.language.old + "\" -> \"" + this.body.changes.language.new + "\"");
        }
        if (typeof this.body.changes.description !== "undefined") {
            changes.push("**Description:** \"" + this.body.changes.description.old + "\" -> \"" + this.body.changes.description.new + "\"");
        }

        this.payload.addEmbed({
            author: user,
            title: "Changed general information of " + body.repository.name,
            url: this.baseLink + body.repository.full_name,
            description: changes.join("\n")
        });
    }

    async repoCommitCommentCreated(){
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Wrote a comment to commit " + this.body.commit.hash.substring(0, 7) + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/commits/" + this.body.commit.hash,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }

    async repoCommitStatusCreated(){
        this.payload.addEmbed({
            author: {
                name: this.body.repository.name,
                url: this.baseLink + this.body.repository.full_name,
                icon_url: this.body.repository.links.avatar.href
            },
            title: this.body.commit_status.name,
            url: this.body.commit_status.url,
            description: "**State:** " + this.body.commit_status.state + "\n" + this.body.commit_status.description
        });
    }

    async repoCommitStatusUpdated() {
        this.payload.addEmbed({
            author: {
                name: this.body.repository.name,
                url: this.baseLink + this.body.repository.full_name,
                icon_url: this.body.repository.links.avatar.href
            },
            title: this.body.commit_status.name,
            url: this.body.commit_status.url,
            description: "**State:** " + this.body.commit_status.state + "\n" + this.body.commit_status.description
        });
    }

    async issueCreated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Created a new Issue on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/issues/" + this.body.issue.id,
            description: "",
            fields: [
                {
                    name: this.body.issue.title,
                    value: "**State:** " + this.body.issue.state + "\n" +
                    "**Type:** " + this.body.issue.type + "\n" +
                    "**Priority:** " + this.body.issue.priority + "\n"
                }
            ]
        });
    }

    async issueUpdated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };
        this.payload.addEmbed({
            author: user,
            title: "Updated Issue #" + this.body.issue.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/issues/" + this.body.issue.id
        });
    }

    async issueCommentCreated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Wrote a comment to Issue #" + this.body.issue.id + " on " + this.body.repository.name,
            url: baseLink + this.body.repository.full_name + "/issues/" + this.body.issue.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }

    async pullrequestCreated(){
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Created a new pull request on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: body.pullrequest.description,
            fields: [
                {
                    name: this.body.pullrequest.title,
                    value: "**Destination branch:** " + this.body.pullrequest.destination.branch.name + "\n" +
                    "**State:** " + this.body.pullrequest.state + "\n"
                }
            ]
        });
    }

    async pullrequestUpdated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Updated pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: this.body.pullrequest.description,
            fields: [
                {
                    name: this.body.pullrequest.title,
                    value: "**Destination branch:** " + this.body.pullrequest.destination.branch.name + "\n" +
                    "**State:** " + this.body.pullrequest.state + "\n"
                }
            ]
        });
    }

    async pullrequestApproved() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Approved pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
        });
    }

    async pullrequestUnapproved() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Removed his approval for pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id
        });
    }

    async pullrequestFulfilled() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Merged pull request #" + this.body.pullrequest.id + " into " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id
        });
    }

    async pullrequestRejected() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Declined pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (typeof this.body.pullrequest.reason !== "undefined") ? ((this.body.pullrequest.reason.replace(/<.*?>/g, '').length > 1024) ? this.body.pullrequest.reason.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.pullrequest.reason.replace(/<.*?>/g, '')) : ""
        });
    }

    async pullrequestCommentCreated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Wrote a comment to pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }

    async pullrequestCommentUpdated() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Updated a comment at pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }

    async pullrequestCommentDeleted() {
        let user = {
            name: this.body.actor.display_name,
            icon_url: this.body.actor.links.avatar.href,
            url: this.baseLink + this.body.actor.username
        };

        this.payload.addEmbed({
            author: user,
            title: "Deleted a comment at pull request #" + this.body.pullrequest.id + " on " + this.body.repository.name,
            url: this.baseLink + this.body.repository.full_name + "/pull-requests/" + this.body.pullrequest.id,
            description: (this.body.comment.content.html.replace(/<.*?>/g, '').length > 1024) ? this.body.comment.content.html.replace(/<.*?>/g, '').substring(0, 1023) + "\u2026" : this.body.comment.content.html.replace(/<.*?>/g, '')
        });
    }
}

module.exports = BitBucket;
