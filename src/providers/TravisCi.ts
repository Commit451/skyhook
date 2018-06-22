import { BaseProvider } from "../util/BaseProvider"

/**
 * https://docs.travis-ci.com/user/notifications/#Configuring-webhook-notifications
 */
class TravisCi extends BaseProvider {

    public static getName() {
        return 'Travis'
    }

    public async parseData() {
        this.payload.setEmbedColor(0xC7B398)
        this.payload.addEmbed({
            title: "Build #" + this.body.number,
            url: this.body.build_url,
            author: {
                name: this.body.repository.name,
            },
            description: "**Status**: " + this.body.status_message,
        })
    }
}

export { TravisCi }
