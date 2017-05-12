// appveyor.js
// https://www.appveyor.com/docs/notifications/#webhook-payload-default
// ========
module.exports = {
    parse: function (req, discordPayload) {
        const body = req.body;
        discordPayload.setEmbedColor(0xFFFFFF);
        discordPayload.addEmbed({
            title: "Build #" + body.eventData.buildNumber,
            url: body.eventData.buildUrl,
            author: {
                name: body.eventData.projectName
            },
            description: "**Status**: " + body.eventData.status
        });
    }
};