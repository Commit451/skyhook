// appveyor.js
// https://www.appveyor.com/docs/notifications/#webhook-payload-default
// ========
module.exports = {
  parse: function (req, discordPayload) {
    var body = req.body
    var buildNumber = body.eventData.buildNumber
    var buildUrl = body.eventData.buildUrl
    var status = body.eventData.status
    discordPayload.content = "Build " + buildNumber + " " + status + "\n" + buildUrl
  }
};