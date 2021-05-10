import * as fs from 'fs'
import { inspect } from 'util'
import { BaseProvider } from '../src/provider/BaseProvider'
import { LoggerUtil } from '../src/util/LoggerUtil'
import { DiscordPayload } from '../src/model/DiscordPayload'

/**
 * Helps with testing things
 */
class Tester {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static async test(provider: BaseProvider, jsonFileName: string = null, headers: any = null, query: any = null): Promise<DiscordPayload> {
        LoggerUtil.init()
        let requestBody = null
        if (jsonFileName != null) {
            requestBody = JSON.parse(Tester.readTestFile(provider, jsonFileName))
        }
        return Tester.testWithBody(provider, requestBody, headers, query)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static async testWithBody(provider: BaseProvider, body: Record<string, any> = null, headers: any = null, query: any = null): Promise<DiscordPayload> {
        LoggerUtil.init()
        try {
            const res = await provider.parse(body, headers, query)
            console.log(inspect(res, false, null, true))
            return Promise.resolve(res)
        } catch (err) {
            console.error(err)
            return Promise.reject(err)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static readTestFile(provider: BaseProvider, fileName: string): any {
        return fs.readFileSync(`./test/${provider.getPath().toLowerCase()}/${fileName}`, 'utf-8')
    }
}

export { Tester }
