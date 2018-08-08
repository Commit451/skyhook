import { assert } from 'chai'
import * as fs from 'fs'
import { BaseProvider } from '../src/provider/BaseProvider'
import { LoggerUtil } from '../src/util/LoggerUtil'

/**
 * Helps with testing things
 */
class Tester {
    public static async test(provider: BaseProvider, jsonFileName: string = null, headers: any = null, query: any = null) {
        LoggerUtil.init()
        let jsonObject: any = null
        if (jsonFileName != null) {
            const json = fs.readFileSync(`./test/${jsonFileName}`, 'utf-8')
            jsonObject = JSON.parse(json)
        }
        const res = await provider.parse(jsonObject, headers, query)
        console.log(JSON.stringify(res))
        assert(res != null)
    }
}

export { Tester }
