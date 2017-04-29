// unity.js
// https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var hookID = body.hookId;

        discordPayload.setEmbedColor(0x222C37);

        if (hookID == null) {
            var projectName = body.projectName;
            var projectTarget = body.buildTargetName;
            var projectVersion = body.buildNumber;
            var share = body.links.share_url;
            var type = body.buildStatus;
            var ref = body.ref;
            var content = "No download available.";
            var user = {
                name: projectTarget,
                icon_url: "https://developer.cloud.unity3d.com/images/icon-default.png"
            };
            var download = "";
            var link = "";
            discordPayload.setUser(projectName + "Buildserver", "https://developer.cloud.unity3d.com/images/icon-default.png");
            switch (type) {
                case "success":
                    if (share != null) {
                        download = share.href;
                        content = "[`Download it here`](" + download + ")";
                    }
                    var link = "";
                    content = "**New build**\n" + content;
                    break;
                case "queued":
                    content = "**In build queue**\nIt will be update to version  #" + projectVersion + "\n";
                    break;
                case "started":
                    content = "**Build is started**\nBuilding version  #" + projectVersion + "\n";
                    break;
                case "failed":
                    content = "**Build failed**\n" + "Latest version is still  #" + (projectVersion - 1) + "\n";
                    break;

            }
            discordPayload.addEmbed({
                title: "[" + projectName + "] " + " version #" + projectVersion,
                url: download,
                author: user,
                description: content
            });
        } else {
            discordPayload.setContent("**Ping from host!**");
        }
    }
};
