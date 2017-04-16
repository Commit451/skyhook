// bitbucket.js
// https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var type = req.get("X-Event-Key");
        var baseLink = 'https://bitbucket.org/';

        discordPayload.embeds = [];

        switch (type) {
            case "repo:push":
                for (var i = 0; i < body.push.changes.length; i++) {
                    var change = body.push.changes[i];
                    var project = {
                        name: body.repository.name,
                        url: baseLink + body.repository.full_name,
                        branch: (change.old != null) ? change.old.name : change.new.name,
                        commits: change.commits
                    };
                    var user = {
                        name: body.actor.display_name,
                        icon_url: body.actor.links.avatar.href,
                        url: baseLink + body.actor.username
                    }

                    var commits = "";
                    for (var i = 0; i < project.commits.length; i++) {
                        var commit = project.commits[i];
                        var message = (commit.message.length > 50) ? commit.message.substring(0, 47) + "..." : commit.message;
                        commits = commits + "[`" + commit.hash.substring(0, 7) + "`](" + commit.links.html.href + ") " + message + " - " + commit.author.user.display_name + "\n";
                    }

                    discordPayload.embeds.push({
                        title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                        url: project.url,
                        author: user,
                        description: commits,
                        footer: {
                            text: "Powered by skyhook",
                            icon_url: ""
                        }
                    });
                }
                break;
            case "repo:fork":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                }
                discordPayload.embeds.push({
                    author: user,
                    description: "Created a [`fork`](" + baseLink + body.fork.full_name + ") of [`" + body.repository.name + "`](" + baseLink + body.repository.full_name + ")",
                    footer: {
                        text: "Powered by skyhook",
                        icon_url: ""
                    }
                });
                break;
            case "repo:updated":
                var user = {
                    name: body.actor.display_name,
                    icon_url: body.actor.links.avatar.href,
                    url: baseLink + body.actor.username
                }

                var changes = [];
                if(typeof body.changes.name !== "undefined"){
                    changes.push("**Name:** \"" + body.changes.name.old + "\" -> \"" + body.changes.name.new + "\"");
                }
                if(typeof body.changes.website !== "undefined"){
                    changes.push("**Website:** \"" + body.changes.website.old + "\" -> \"" + body.changes.website.new + "\"");
                }
                if(typeof body.changes.language !== "undefined"){
                    changes.push("**Language:** \"" + body.changes.language.old + "\" -> \"" + body.changes.language.new + "\"");
                }
                if(typeof body.changes.description !== "undefined"){
                    changes.push("**Description:** \"" + body.changes.description.old + "\" -> \"" + body.changes.description.new + "\"");
                }

                discordPayload.embeds.push({
                    author: user,
                    title: "Changed general information of " + body.repository.name,
                    url: baseLink + body.repository.full_name,
                    description: changes.join("\n"),
                    footer: {
                        text: "Powered by skyhook",
                        icon_url: ""
                    }
                });
                break;
        }
        //TODO: support of the other webhook methods of BitBucket
    }
};
