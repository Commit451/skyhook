const DiscordPayload = require('./DiscordPayload');
const camel = require('camelcase');

class BaseProvider {
    constructor() {
        this.payload = new DiscordPayload();
    }

    async parse(req){
        this.req = req;
        this.body = req.body;

        let type = 'parseData';
        if(typeof this['getType'] !== 'undefined'){
            type = await this['getType']();
        }
        type = BaseProvider.formatType(type);

        if(typeof this[type] !== 'undefined'){
            await this[type]();
        }

        return this.payload.getData();
    }

    static formatType(type){
        type = type.replace(/:/, '_'); // needed because of BitBucket
        return camel(type);
    }
}

module.exports = BaseProvider;