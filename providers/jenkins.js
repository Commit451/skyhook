// jenkins.js
// https://plugins.jenkins.io/notification
// ========
module.exports = {
    parse: function (req, discordPayload) {
        const body = req.body;
        discordPayload.setEmbedColor(0xF0D6B7);
        const phase = body.build.phase;

        console.log(body);

        switch (phase) {
            case "STARTED":
                discordPayload.addEmbed({
                    title: "Project " + body.name,
                    url: body.build.full_url,
                    description: "Started build #" + body.build.number
                });
                break;
            case "COMPLETED":
            case "FINALIZED":
                discordPayload.addEmbed({
                    title: "Project " + body.name,
                    url: body.build.full_url,
                    description: this.capitalize(phase) + " build #" + body.build.number + " with status: " + body.build.status
                });
                break;
        }
    },
    capitalize: function (string) {
        const tmp = string.toLowerCase();
        return tmp.charAt(0).toUpperCase() + tmp.slice(1);
    }
};