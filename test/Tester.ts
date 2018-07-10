import { assert } from 'chai'

class Tester {
    public static async test(provider: any, json: any, headers: any) {
        const res = await provider.parse(json, headers)
        console.log(JSON.stringify(res))
        assert(res !== null)
    }
}

export { Tester }
