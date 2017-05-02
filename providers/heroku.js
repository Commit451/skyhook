// heroku.js
// https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook
// ========
module.exports = {
    parse: function (req, discordPayload) {
        discordPayload.setEmbedColor(0xC9C3E6);
        discordPayload.addEmbed({
            title: "Deployed App " + req.body.app,
            url: req.body.url,
            author: {
                name: req.body.user
            }
        });
    }
};