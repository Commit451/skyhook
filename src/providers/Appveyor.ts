import { BaseProvider } from "../util/BaseProvider"

/**
 * https://www.appveyor.com/docs/notifications/#webhook-payload-default
 */
class AppVeyor extends BaseProvider {

    public static getName() {
        return 'AppVeyor'
    }

    public async parseData() {
        this.payload.setEmbedColor(0xFFFFFF)
        this.payload.addEmbed({
            author: {
                name: this.body.eventData.projectName,
            },
            description: "**Status**: " + this.body.eventData.status,
            title: "Build #" + this.body.eventData.buildNumber,
            url: this.body.eventData.buildUrl,
        })
    }
}

export { AppVeyor }
