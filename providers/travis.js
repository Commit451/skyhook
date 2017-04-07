// travis.js
// https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
// ========
module.exports = {
  parse: function (req, discordPayload) {
    var body = req.body
    var id = body.id
    var buildUrl = body.build_url
    var status = body.status_message
    discordPayload.content = "Build " + id + " " + status + "\n" + buildUrl
  }
};