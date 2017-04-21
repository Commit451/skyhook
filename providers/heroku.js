// heroku.js
// https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var app = req.body.app;
        var user = req.body.user;
        var url = req.body.url;
        discordPayload.content = "App " + app + " deployed by " + user + "\n" + url
    }
};