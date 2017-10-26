// twitch.js
// https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html
// ========
const BaseProvider = require('../util/BaseProvider');

class Twitch extends BaseProvider {
    constructor() {
        super();
        this.payload.setEmbedColor(0x6441a4);
        this.baseLink = 'https://twitch.tv/';
    }

    static getName() {
        return 'Twitch';
    }

    async getType() {
        let type = this.req.body.topic.substring(this.req.body.topic.lastIndexOf('/')+1);
        type = type.substring(0, type.indexOf('?'));
        return type;
    }

    async follows() {
        console.log(req.body)
        console.log('got payload follows')
    }
    
}

module.exports = Twitch;