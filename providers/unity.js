// unity.js
// https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var hookID = body.hookId;

        if (hookID == null) {
            var projectName = body.projectName;
            var projectTarget = body.buildTargetName;
            var projectVersion = body.buildNumber;
            var share = body.links.share_url;
            var type = body.buildStatus;
            var ref = body.ref;
            var download = "No download available.";
            discordPayload.username = projectName + " Buildserver";
            discordPayload.avatar_url = "https://developer.cloud.unity3d.com/images/icon-default.png";
            switch (type) {
                case "success":
                    if (share != null) {
                        var shareUrl = share.href;
                        download = "Download it here: " + shareUrl
                    }
                    discordPayload.content = "\n**" + projectTarget + " got a new build**\n" + projectName + " latest version is now  #" + projectVersion + "\n" + download;
                    break;
                case "queued":
                    discordPayload.content = "\n**" + projectTarget + " is in build queue**\n" + projectName + " it will be update to version  #" + projectVersion + "\n";
                    break;
                case "started":
                    discordPayload.content = "\n**" + projectTarget + " build is started**\n" + projectName + " it is building version  #" + projectVersion + "\n";
                    break;
                case "failed":
                    discordPayload.content = "\n**" + projectTarget + " build is failed**\n" + projectName + " latest version is still  #" + (projectVersion - 1) + "\n";
                    break;

            }
        }
        else {
            console.log(req.body.hookId);
            discordPayload.content = "**Ping from host!**";
            discordPayload.name = " Unity Hook Ping";
            discordPayload.avatar_url = "https://developer.cloud.unity3d.com/images/icon-default.png";
        }
    }
};
