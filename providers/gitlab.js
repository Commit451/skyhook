// gitlab.js
// https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var username = body.user_name;
        var type = body.object_kind;
        var ref = body.ref;
        switch (type) {
            case "push":
                var project = {
                    name: body.project.name,
                    url: body.project.web_url,
                    branch: body.ref.split("/")[2],
                    commits: body.commits
                };
                var user = {
                    name: body.user_name,
                    icon_url: body.user_avatar
                };

                var commits = "";
                for (var i = 0; i < project.commits.length; i++) {
                    var commit = project.commits[i];
                    var message = (commit.message.length > 50) ? commit.message.substring(0, 47) + "..." : commit.message;
                    commits = commits + commit.author.name + " - (" + "[`" + commit.id.substring(0, 7) + "`](" + commit.url + ") " + ") [" + message.replace(/\n/g, ' ') + "](" + project.url + ") " + "\n";
                }

                discordPayload.embeds = [{
                    title: "[" + project.name + ":" + project.branch + "] " + project.commits.length + " commit" + ((project.commits.length > 1) ? "s" : ""),
                    url: project.url,
                    author: user,
                    description: commits,
                    footer: {
                        text: "Powered by Skyhook",

                        icon_url: ""
                    }
                }];
                break;

            case "tag_push":
                var url = body.project.web_url;
                var projectName = body.project.name;
                //get the name of the tag
                var split = ref.split("/");
                var tag = split[2];
                discordPayload.content = username + " pushed tag " + ref + " to " + projectName + "\n" + url + "/tags/" + tag;
                break;

            case "issue":
                var projectName = body.project.name;
                var action = body.object_attributes.state;
                var user = body.user.username;
                var issueUrl = body.object_attributes.url;
                discordPayload.content = user + " " + action + " issue on " + projectName + "\n" + issueUrl;
                break;

            case "note":
                var projectName = body.project.name;
                var action = body.object_attributes.state;
                var user = body.user.username;
                var noteUrl = body.object_attributes.url;
                var noteType = body.object_attributes.noteable_type;
                var note = body.object_attributes.note;
                discordPayload.content = user + " commented on " + noteType + " on " + projectName + "\n" + "\"" + note + "\"" + "\n" + noteUrl;
                break;

            case "merge_request":
                var action = body.object_attributes.state;
                var user = body.user.username;
                var issueUrl = body.object_attributes.url;
                discordPayload.content = user + " " + action + " merge request\n" + issueUrl;
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
