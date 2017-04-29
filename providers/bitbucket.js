// bitbucket.js
// https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var type = req.get("X-Event-Key");
        var baseLink = 'https://bitbucket.org/';

        discordPayload.setEmbedColor(0x205081);

        switch (type) {
            case "repo:push":
                var project = {
                    name: body.repository.name,
                    url: baseLink + body.repository.full_name,
                    branch: null,
                    commits: null
                };
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };
                for (var i = 0; i < body.push.changes.length; i++) {
                    var change = body.push.changes[i];
                    project.branch = (change.old !== null) ? change.old.name : change.new.name;
                    project.commits = change.commits;

                    var commits = "";
                    for (var j = 0; j < project.commits.length; j++) {
                        var commit = project.commits[j];
                        var message = (commit.message.length > 50) ? commit.message.substring(0, 47) + "..." : commit.message;
                        commits = commits + "[`" + commit.hash.substring(0, 7) + "`](" + commit.links.html.href + ") " + message + " - " + commit.author.user.display_name + "\n";
                    }

                    discordPayload.addEmbed({
                        title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                        url: project.url,
                        author: user,
                        description: commits
                    });
                }
                break;
            case "repo:fork":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };
                discordPayload.addEmbed({
                    author: user,
                    description: "Created a [`fork`](" + baseLink + body.fork.full_name + ") of [`" + body.repository.name + "`](" + baseLink + body.repository.full_name + ")"
                });
                break;
            case "repo:updated":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                var changes = [];
                if (typeof body.changes.name !== "undefined") {
                    changes.push("**Name:** \"" + body.changes.name.old + "\" -> \"" + body.changes.name.new + "\"");
                }
                if (typeof body.changes.website !== "undefined") {
                    changes.push("**Website:** \"" + body.changes.website.old + "\" -> \"" + body.changes.website.new + "\"");
                }
                if (typeof body.changes.language !== "undefined") {
                    changes.push("**Language:** \"" + body.changes.language.old + "\" -> \"" + body.changes.language.new + "\"");
                }
                if (typeof body.changes.description !== "undefined") {
                    changes.push("**Description:** \"" + body.changes.description.old + "\" -> \"" + body.changes.description.new + "\"");
                }

                discordPayload.addEmbed({
                    author: user,
                    title: "Changed general information of " + body.repository.name,
                    url: baseLink + body.repository.full_name,
                    description: changes.join("\n")
                });
                break;
            case "repo:commit_comment_created":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Wrote a comment to commit " + body.commit.hash.substring(0, 7) + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/commits/" + body.commit.hash,
                    description: (body.comment.content.html.replace(/<.*?>/g, '').length > 100) ? body.comment.content.html.replace(/<.*?>/g, '').substring(0, 97) + "..." : body.comment.content.html.replace(/<.*?>/g, '')
                });
                break;
            case "repo:commit_status_created":
                discordPayload.addEmbed({
                    author: {
                        name: body.repository.name,
                        url: baseLink + body.repository.full_name,
                        icon_url: body.repository.links.avatar.href
                    },
                    title: body.commit_status.name,
                    url: body.commit_status.url,
                    description: "**State:** " + body.commit_status.state + "\n" + body.commit_status.description
                });
                break;
            case "repo:commit_status_updated":
                discordPayload.addEmbed({
                    author: {
                        name: body.repository.name,
                        url: baseLink + body.repository.full_name,
                        icon_url: body.repository.links.avatar.href
                    },
                    title: body.commit_status.name,
                    url: body.commit_status.url,
                    description: "**State:** " + body.commit_status.state + "\n" + body.commit_status.description
                });
                break;
            case "issue:created":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Created a new Issue on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/issues/" + body.issue.id,
                    description: "",
                    fields: [
                        {
                            name: body.issue.title,
                            value: "**State:** " + body.issue.state + "\n" +
                            "**Type:** " + body.issue.type + "\n" +
                            "**Priority:** " + body.issue.priority + "\n"
                        }
                    ]
                });
                break;
            case "issue:updated":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };
                discordPayload.addEmbed({
                    author: user,
                    title: "Updated Issue #" + body.issue.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/issues/" + body.issue.id
                });
                break;
            case "issue:comment_created":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Wrote a comment to Issue #" + body.issue.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/issues/" + body.issue.id,
                    description: (body.comment.content.html.replace(/<.*?>/g, '').length > 100) ? body.comment.content.html.replace(/<.*?>/g, '').substring(0, 97) + "..." : body.comment.content.html.replace(/<.*?>/g, '')
                });
                break;
            case "pullrequest:created":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Created a new pull request on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: body.pullrequest.description,
                    fields: [
                        {
                            name: body.pullrequest.title,
                            value: "**Destination branch:** " + body.pullrequest.destination.branch.name + "\n" +
                            "**State:** " + body.pullrequest.state + "\n"
                        }
                    ]
                });
                break;
            case "pullrequest:updated":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Updated pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: body.pullrequest.description,
                    fields: [
                        {
                            name: body.pullrequest.title,
                            value: "**Destination branch:** " + body.pullrequest.destination.branch.name + "\n" +
                            "**State:** " + body.pullrequest.state + "\n"
                        }
                    ]
                });
                break;
            case "pullrequest:approved":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Approved pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                });
                break;
            case "pullrequest:unapproved":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Removed his approval for pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id
                });
                break;
            case "pullrequest:fulfilled":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Merged pull request #" + body.pullrequest.id + " into " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id
                });
                break;
            case "pullrequest:rejected":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Declined pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: (typeof body.pullrequest.reason !== "undefined") ? body.pullrequest.reason : ""
                });
                break;
            case "pullrequest:comment_created":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Wrote a comment to pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: (body.comment.content.html.replace(/<.*?>/g, '').length > 100) ? body.comment.content.html.replace(/<.*?>/g, '').substring(0, 97) + "..." : body.comment.content.html.replace(/<.*?>/g, '')
                });
                break;
            case "pullrequest:comment_updated":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Updated a comment at pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: (body.comment.content.html.replace(/<.*?>/g, '').length > 100) ? body.comment.content.html.replace(/<.*?>/g, '').substring(0, 97) + "..." : body.comment.content.html.replace(/<.*?>/g, '')
                });
                break;
            case "pullrequest:comment_deleted":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                };

                discordPayload.addEmbed({
                    author: user,
                    title: "Deleted a comment at pull request #" + body.pullrequest.id + " on " + body.repository.name,
                    url: baseLink + body.repository.full_name + "/pull-requests/" + body.pullrequest.id,
                    description: (body.comment.content.html.replace(/<.*?>/g, '').length > 100) ? body.comment.content.html.replace(/<.*?>/g, '').substring(0, 97) + "..." : body.comment.content.html.replace(/<.*?>/g, '')
                });
                break;
        }
    }
};
