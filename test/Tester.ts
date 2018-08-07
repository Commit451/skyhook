import { assert } from 'chai'
import * as fs from 'fs'
import { BaseProvider } from '../src/provider/BaseProvider'
import { LoggerUtil } from '../src/util/LoggerUtil'

/**
 * Helps with testing things
 */
class Tester {
    public static async test(provider: BaseProvider, jsonFileName: string, headers: any) {
        LoggerUtil.init()
        const json = fs.readFileSync(`./test/${jsonFileName}`, 'utf-8')
        const res = await provider.parse(JSON.parse(json), headers)
        console.log(JSON.stringify(res))
        assert(res != null)
    }
}

export { Tester }
