import { assert } from 'chai'
import { LoggerUtil } from '../src/util/LoggerUtil'

/**
 * Helps with testing things
 */
class Tester {
    public static async test(provider: any, json: any, headers: any) {
        LoggerUtil.init()
        const res = await provider.parse(json, headers)
        console.log(JSON.stringify(res))
        assert(res != null)
    }
}

export { Tester }
