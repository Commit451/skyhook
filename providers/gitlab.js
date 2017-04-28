// gitlab.js
// https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var ref = body.ref;
        discordPayload.setEmbedColor(0xFCA326);

        switch (body.object_kind) {
            case "push":
                var project = {
                    name: body.project.name,
                    url: body.project.web_url,
                    branch: body.ref.split("/")[2],
                    commits: body.commits
                };

                var commits = "";
                for (var i = 0; i < project.commits.length; i++) {
                    var commit = project.commits[i];
                    var message = (commit.message.length > 50) ? commit.message.substring(0, 47) + "..." : commit.message;
                    commits = commits + commit.author.name + " - (" + "[`" + commit.id.substring(0, 7) + "`](" + commit.url + ")" + ") " + message.replace(/\n/g, " ").replace(/\r/g, " ") + "\n";
                }

                discordPayload.addEmbed({
                    title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                    url: project.url,
                    author: {
                        name: body.user_name,
                        icon_url: body.user_avatar
                    },
                    description: commits
                });
                break;

            case "tag_push":
                var tag = ref.split("/")[2];
                var project = {
                    name: body.project.name,
                    url: body.project.web_url,
                    branch: body.ref.split("/")[2],
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
                        description: (typeof body.message !== 'undefined') ? body.message : ''
                    });
                } else {
                    discordPayload.addEmbed({
                        title: "Deleted tag \"" + tag + "\" on " + project.name,
                        url: project.url + '/tags/' + tag,
                        author: {
                            name: body.user_name,
                            icon_url: body.user_avatar
                        },
                        description: (typeof body.message !== 'undefined') ? body.message : ''
                    });
                }
                break;

            case "issue":
                var actions = {
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
                            value: (body.object_attributes.description.length > 200) ? body.object_attributes.description.substring(0, 197) + "..." : body.object_attributes.description
                        }
                    ]
                });
                break;

            case "note":
                var type = null;
                switch(body.object_attributes.noteable_type){
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
                    description: (body.object_attributes.note.length > 50) ? body.object_attributes.note.substring(0, 47) + "..." : body.object_attributes.note
                });
                break;

            case "merge_request":
                var actions = {
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
                            value: (body.object_attributes.description.length > 200) ? body.object_attributes.description.substring(0, 197) + "..." : body.object_attributes.description
                        }
                    ]
                });
                break;

            case "wiki_page":
                var action = body.object_attributes.state;
                var user = body.user.username;
                var issueUrl = body.object_attributes.url;
                discordPayload.content = user + " " + action + " wiki page\n" + issueUrl;
                break;

            case "pipeline":
                var pipelineId = body.object_attributes.id;
                var status = body.object_attributes.status;
                //pipeline events don't give us a url, but we can create one
                var url = body.project.web_url + "/pipelines/" + pipelineId;
                discordPayload.content = "Pipeline status: " + status + "\n" + url;
                break;

            case "build":
                var buildId = body.build_id;
                var status = body.build_status;
                //pipeline events don't give us a url, but we can create one
                var url = body.repository.homepage + "/builds/" + buildId;
                discordPayload.content = "Build status: " + status + "\n" + url;
                break;
        }
    }
};
