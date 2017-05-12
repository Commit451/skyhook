// circleci.js
// https://circleci.com/docs/1.0/configuration/#notify
// ========
module.exports = {
    parse: function (req, discordPayload) {
        const body = req.body;
        discordPayload.setEmbedColor(0x000000);
        discordPayload.addEmbed({
            title: "Build #" + body.payload.build_num,
            url: body.payload.build_url,
            author: {
                name: body.payload.reponame
            },
            description: "**Outcome**: " + body.payload.outcome
        });
    }
};