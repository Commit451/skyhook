// gitlab.js
// https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md
// ========
module.exports = {
  parse: function (req, discordPayload) {
    var body = req.body
    var type = body.object_kind
    switch (type) {
      case "push":
        break;
    }
    discordPayload.content = body.before;
  }
};