import { Request } from "express"
import { DiscordPayload } from "./DiscordPayload"

const camel = require('camelcase')

class BaseProvider {

    public static formatType(type: string) {
        type = type.replace(/:/, '_') // needed because of BitBucket
        return camel(type)
    }

    private payload: DiscordPayload
    private req: Request
    private body: any

    constructor() {
        this.payload = new DiscordPayload()
    }

    public async parse(req: Request) {
        this.req = req
        this.body = req.body

        let type = 'parseData'
        if (typeof this['getType'] !== 'undefined') {
            type = await this['getType']()
        }
        type = BaseProvider.formatType(type)

        if (typeof this[type] !== 'undefined') {
            console.log('[' + (new Date()).toUTCString() + '] Calling ' + type + '() in ' + this.constructor.name + ' provider.')
            await this[type]()
        }

        return this.payload.getData()
    }
}

export { BaseProvider }
