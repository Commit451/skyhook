// asana.js
// https://asana.com/developers/api-reference/webhooks
// ========
const BaseProvider = require('../util/BaseProvider');
const request = require('request');

class Asana extends BaseProvider {

    constructor(){
        super();
        this.baseLink = 'https://app.asana.com/api/1.0/';
    }

    static getName() {
        return 'Asana';
    }

    async getType() {
        return this.req.get('X-Hook-Secret') != null ? 'validate' : 'parseData';
    }

    async parseData() {
        console.log(this.req.body);
    }

    /**
     * Validates an Asana webhook. The X-Hook-Secret is added to the response
     * header. The discord payload's data is set to null so that no further
     * propagation will take place in server.js.
     */
    async validate() {
        this.res.header('X-Hook-Secret', this.req.get('X-Hook-Secret'));
        this.res.sendStatus(200);

        this.payload.data = null;
    }

}

module.exports = Asana;