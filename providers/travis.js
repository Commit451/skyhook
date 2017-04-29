// travis.js
// https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        discordPayload.setEmbedColor(0x000000);
        discordPayload.addEmbed({
            title: "Build #" + body.number,
            url: body.build_url,
            author: {
                name: body.repository.name
            },
            description: "**Status**: " + body.status_message
        });
    }
};