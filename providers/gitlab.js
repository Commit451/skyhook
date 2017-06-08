// gitlab.js
// https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
// ========
module.exports = {
    parse: function (req, discordPayload) {
        const body = req.body;
        discordPayload.setEmbedColor(0xFCA326);

        let project = null;
        let actions = null;

        switch (body.object_kind) {
            case "push":
                const branch = body.ref.split("/");
                branch.shift();
                branch.shift();

                project = {
                    name: body.project.name,
                    url: body.project.web_url,
                    branch: branch.join("/"),
                    commits: body.commits
                };

                let commits = [];
                for (let i = 0; (i < project.commits.length && i < 4); i++) {
                    const commit = project.commits[i];
                    const message = (commit.message.length > 256) ? commit.message.substring(0, 253) + "..." : commit.message;

                    commits.push({
                        name: "Commit from " + commit.author.name,
                        value: "(" + "[`" + commit.id.substring(0, 7) + "`](" + commit.url + ")" + ")" + message.replace(/\n/g, " ").replace(/\r/g, " "),
                        inline: false
                    });
                    //commits = commits + commit.author.name + " - (" + "[`" + commit.id.substring(0, 7) + "`](" + commit.url + ")" + ") " + message.replace(/\n/g, " ").replace(/\r/g, " ") + "\n";
                }

                discordPayload.addEmbed({
                    title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                    url: project.url,
                    author: {
                        name: body.user_name,
                        icon_url: body.user_avatar
                    },
                    fields: commits
                    //description: commits
                });
                break;

            case "tag_push":
                const tmpTag = body.ref.split("/");
                tmpTag.shift();
                tmpTag.shift();
                const tag = tmpTag.join("/");

                project = {
                    name: body.project.name,
                    url: body.project.web_url,
                    commits: body.commits
                };

                if (body.after !== '0000000000000000000000000000000000000000') {
                    discordPayload.addEmbed({
                        title: "Pushed tag \"" + tag + "\" to " + project.name,
                        url: project.url + '/tags/' + tag,
                        author: {
                            name: body.user_name,
                            icon_url: body.user_avatar
                        },
                        description: (typeof body.message !== 'undefined') ? ((body.message.length > 1024) ? body.message.substring(0, 1021) + "..." : body.message) : ''
                    });
                } else {
                    discordPayload.addEmbed({
                        title: "Deleted tag \"" + tag + "\" on " + project.name,
                        url: project.url + '/tags/' + tag,
                        author: {
                            name: body.user_name,
                            icon_url: body.user_avatar
                        },
                        description: (typeof body.message !== 'undefined') ? ((body.message.length > 1024) ? body.message.substring(0, 1021) + "..." : body.message) : ''
                    });
                }
                break;

            case "issue":
                actions = {
                    open: "Opened",
                    close: "Closed",
                    reopen: "Reopened",
                    update: "Updated"
                };

                discordPayload.addEmbed({
                    title: actions[body.object_attributes.action] + " issue #" + body.object_attributes.iid + " on " + body.project.name,
                    url: body.object_attributes.url,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    fields: [
                        {
                            name: body.object_attributes.title,
                            value: (body.object_attributes.description.length > 1024) ? body.object_attributes.description.substring(0, 1021) + "..." : body.object_attributes.description
                        }
                    ]
                });
                break;

            case "note":
                let type = null;
                switch (body.object_attributes.noteable_type) {
                    case "Commit":
                        type = "commit (" + body.commit.id.substring(0, 7) + ")";
                        break;
                    case "MergeRequest":
                        type = "merge request #" + body.merge_request.iid;
                        break;
                    case "Issue":
                        type = "issue #" + body.issue.iid;
                        break;
                    case "Snippet":
                        type = "snippet #" + body.snippet.id;
                        break;
                }

                discordPayload.addEmbed({
                    title: "Wrote a comment on " + type + " on " + body.project.name,
                    url: body.object_attributes.url,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    description: (body.object_attributes.note.length > 2048) ? body.object_attributes.note.substring(0, 2045) + "..." : body.object_attributes.note
                });
                break;

            case "merge_request":
                actions = {
                    open: "Opened",
                    close: "Closed",
                    reopen: "Reopened",
                    update: "Updated",
                    merge: "Merged"
                };

                discordPayload.addEmbed({
                    title: actions[body.object_attributes.action] + " merge request #" + body.object_attributes.iid + " on " + body.project.name,
                    url: body.object_attributes.url,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    fields: [
                        {
                            name: body.object_attributes.title,
                            value: (body.object_attributes.description.length > 1024) ? body.object_attributes.description.substring(0, 1021) + "..." : body.object_attributes.description
                        }
                    ]
                });
                break;

            case "wiki_page":
                actions = {
                    create: "Created",
                    delete: "Deleted",
                    update: "Updated"
                };

                discordPayload.addEmbed({
                    title: actions[body.object_attributes.action] + " wiki page " + body.object_attributes.title + " on " + body.project.name,
                    url: body.object_attributes.url,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    description: (typeof body.object_attributes.message !== 'undefined' ) ? (body.object_attributes.message.length > 2048) ? body.object_attributes.message.substring(0, 2045) + "..." : body.object_attributes.message : ''
                });
                break;

            case "pipeline":
                discordPayload.addEmbed({
                    title: "Pipeline #" + body.object_attributes.id + " on " + body.project.name,
                    url: body.project.web_url + "/pipelines/" + body.object_attributes.id,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    description: "**Status**: " + body.object_attributes.status
                });
                break;

            case "build":
                discordPayload.addEmbed({
                    title: "Build #" + build_id + " on " + body.project.name,
                    url: body.project.web_url + "/builds/" + body.build_id,
                    author: {
                        name: body.user.name,
                        icon_url: body.user.avatar_url
                    },
                    description: "**Status**: " + body.build_status
                });
                break;
        }
    }
};
