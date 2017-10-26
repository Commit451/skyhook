// heroku.js
// https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook
// ========
const BaseProvider = require('../util/BaseProvider');

class Heroku extends BaseProvider {
    static getName() {
        return 'Heroku';
    }

    async parseData() {
        this.payload.setEmbedColor(0xC9C3E6);
        this.payload.addEmbed({
            title: "Deployed App " + this.body.app,
            url: this.body.url,
            author: {
                name: this.body.user
            }
        });
    }
}

module.exports = Heroku;