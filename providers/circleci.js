// circleci.js
// https://circleci.com/docs/1.0/configuration/#notify
// ========
module.exports = {
    parse: function (req, discordPayload) {
        var body = req.body;
        var id = body.payload.build_num;
        var buildUrl = body.payload.build_url;
        var outcome = body.payload.outcome;
        discordPayload.content = "Build " + id + " " + outcome + "\n" + buildUrl
    }
};