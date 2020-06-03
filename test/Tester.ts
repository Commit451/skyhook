import * as fs from 'fs'
import { inspect } from 'util'
import { BaseProvider } from '../src/provider/BaseProvider'
import { LoggerUtil } from '../src/util/LoggerUtil'
import { DiscordPayload } from '../src/model/DiscordPayload'

/**
 * Helps with testing things
 */
class Tester {
    public static async test(provider: BaseProvider, jsonFileName: string = null, headers: any = null, query: any = null): Promise<DiscordPayload> {
        LoggerUtil.init()
        let jsonObject: any = null
        if (jsonFileName != null) {
            const json = fs.readFileSync(`./test/${provider.getPath().toLowerCase()}/${jsonFileName}`, 'utf-8')
            jsonObject = JSON.parse(json)
        }
        try {
            const res = await provider.parse(jsonObject, headers, query)
            console.log(inspect(res, false, null, true))
            return Promise.resolve(res)
        } catch (err) {
            console.error(err)
            return Promise.reject(err)
        }
    }
}

export { Tester }
