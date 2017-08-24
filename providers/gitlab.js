// gitlab.js
// https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
// ========
const BaseProvider = require('../util/BaseProvider');

class GitLab extends BaseProvider {
    constructor() {
        super();
        this.payload.setEmbedColor(0xFCA326);
    }

    static getName() {
        return 'GitLab';
    }

    async getType() {
        return this.body.object_kind;
    }

    async push() {
        let branch = this.body.ref.split("/");
        branch.shift();
        branch.shift();

        let project = {
            name: this.body.project.name,
            url: this.body.project.web_url,
            branch: branch.join("/"),
            commits: this.body.commits
        };

        let commits = [];
        for (let i = 0; (i < project.commits.length && i < 4); i++) {
            const commit = project.commits[i];
            const message = (commit.message.length > 256) ? commit.message.substring(0, 255) + "\u2026" : commit.message;

            commits.push({
                name: "Commit from " + commit.author.name,
                value: "(" + "[`" + commit.id.substring(0, 7) + "`](" + commit.url + ")" + ") " + message.replace(/\n/g, " ").replace(/\r/g, " "),
                inline: false
            });
        }

        this.payload.addEmbed({
            title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
            url: project.url,
            author: {
                name: this.body.user_name,
                icon_url: GitLab._formatAvatarURL(this.body.user_avatar)
            },
            fields: commits
        });
    }

    async tagPush() {
        let tmpTag = this.body.ref.split("/");
        tmpTag.shift();
        tmpTag.shift();
        let tag = tmpTag.join("/");

        let project = {
            name: this.body.project.name,
            url: this.body.project.web_url,
            commits: this.body.commits
        };

        if (this.body.after !== '0000000000000000000000000000000000000000') {
            this.payload.addEmbed({
                title: "Pushed tag \"" + tag + "\" to " + project.name,
                url: project.url + '/tags/' + tag,
                author: {
                    name: this.body.user_name,
                    icon_url: GitLab._formatAvatarURL(this.body.user_avatar)
                },
                description: (typeof this.body.message !== 'undefined') ? ((this.body.message.length > 1024) ? this.body.message.substring(0, 1023) + "\u2026" : this.body.message) : ''
            });
        } else {
            this.payload.addEmbed({
                title: "Deleted tag \"" + tag + "\" on " + project.name,
                url: project.url + '/tags/' + tag,
                author: {
                    name: this.body.user_name,
                    icon_url: GitLab._formatAvatarURL(this.body.user_avatar)
                },
                description: (typeof this.body.message !== 'undefined') ? ((this.body.message.length > 1024) ? this.body.message.substring(0, 1023) + "\u2026" : this.body.message) : ''
            });
        }
    }

    async issue() {
        const actions = {
            open: "Opened",
            close: "Closed",
            reopen: "Reopened",
            update: "Updated"
        };

        this.payload.addEmbed({
            title: actions[this.body.object_attributes.action] + " issue #" + this.body.object_attributes.iid + " on " + this.body.project.name,
            url: this.body.object_attributes.url,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            fields: [
                {
                    name: this.body.object_attributes.title,
                    value: (this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + "\u2026" : this.body.object_attributes.description
                }
            ]
        });
    }

    async note() {
        let type = null;
        switch (this.body.object_attributes.noteable_type) {
            case "Commit":
                type = "commit (" + this.body.commit.id.substring(0, 7) + ")";
                break;
            case "MergeRequest":
                type = "merge request #" + this.body.merge_request.iid;
                break;
            case "Issue":
                type = "issue #" + this.body.issue.iid;
                break;
            case "Snippet":
                type = "snippet #" + this.body.snippet.id;
                break;
        }

        this.payload.addEmbed({
            title: "Wrote a comment on " + type + " on " + this.body.project.name,
            url: this.body.object_attributes.url,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            description: (this.body.object_attributes.note.length > 2048) ? this.body.object_attributes.note.substring(0, 2047) + "\u2026" : this.body.object_attributes.note
        });
    }

    async mergeRequest() {
        const actions = {
            open: "Opened",
            close: "Closed",
            reopen: "Reopened",
            update: "Updated",
            merge: "Merged"
        };

        this.payload.addEmbed({
            title: actions[this.body.object_attributes.action] + " merge request #" + this.body.object_attributes.iid + " on " + this.body.project.name,
            url: this.body.object_attributes.url,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            fields: [
                {
                    name: this.body.object_attributes.title,
                    value: (this.body.object_attributes.description.length > 1024) ? this.body.object_attributes.description.substring(0, 1023) + "\u2026" : this.body.object_attributes.description
                }
            ]
        });
    }

    async wikiPage() {
        const actions = {
            create: "Created",
            delete: "Deleted",
            update: "Updated"
        };

        this.payload.addEmbed({
            title: actions[this.body.object_attributes.action] + " wiki page " + this.body.object_attributes.title + " on " + this.body.project.name,
            url: this.body.object_attributes.url,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            description: (typeof this.body.object_attributes.message !== 'undefined' ) ? (this.body.object_attributes.message.length > 2048) ? this.body.object_attributes.message.substring(0, 2047) + "\u2026" : this.body.object_attributes.message : ''
        });
    }


    async pipeline() {
        this.payload.addEmbed({
            title: "Pipeline #" + this.body.object_attributes.id + " on " + this.body.project.name,
            url: this.body.project.web_url + "/pipelines/" + this.body.object_attributes.id,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            description: "**Status**: " + this.body.object_attributes.status
        });
    }

    async build() {
        this.payload.addEmbed({
            title: "Build #" + this.body.build_id + " on " + this.body.repository.name,
            url: this.body.repository.homepage + "/builds/" + this.body.build_id,
            author: {
                name: this.body.user.name,
                icon_url: GitLab._formatAvatarURL(this.body.user.avatar_url)
            },
            description: "**Status**: " + this.body.build_status
        });
    }

    static _formatAvatarURL(url) {
        if (!/^https?:\/\/|^\/\//i.test(url)) {
            return "https://gitlab.com" + url;
        }
        return url;
    }
}

module.exports = GitLab;
