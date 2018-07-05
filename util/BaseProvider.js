const DiscordPayload = require('./DiscordPayload');
const camel = require('camelcase');
const winston = require('winston');

class BaseProvider {

    static formatType(type) {
        type = type.replace(/:/, '_'); // needed because of BitBucket
        return camel(type);
    }

    constructor() {
        this.payload = new DiscordPayload();
        this.logger = winston.loggers.get('logger');
    }

    async parse(req) {
        this.req = req;
        this.body = req.body;

        let type = 'parseData';
        if (typeof this['getType'] !== 'undefined') {
            type = await this['getType']();
        }
        type = BaseProvider.formatType(type);

        if (typeof this[type] !== 'undefined') {
            this.logger.info(`Calling ${type}() in ${this.constructor.name} provider.`);
            await this[type]();
        }

        return this.payload.getData();
    }
}

module.exports = BaseProvider;