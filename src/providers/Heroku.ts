import { BaseProvider } from "../util/BaseProvider"

/**
 * https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook
 */
class Heroku extends BaseProvider {

    public static getName() {
        return 'Heroku'
    }

    public async parseData() {
        this.payload.setEmbedColor(0xC9C3E6)
        this.payload.addEmbed({
            title: "Deployed App " + this.body.app,
            url: this.body.url,
            author: {
                name: this.body.user,
            },
        })
    }
}

export { Heroku }
