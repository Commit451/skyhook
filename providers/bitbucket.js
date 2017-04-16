// bitbucket.js
// https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var baseLink = 'https://bitbucket.org/';

        discordPayload.embeds = [];

        if (typeof body.push !== "undefined") { // push event
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
        } else if (typeof body.fork !== "undefined") { // fork event
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
        }
        //TODO: support of the other webhook methods of BitBucket
    }
};
