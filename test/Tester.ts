import { existsSync, readFileSync } from 'node:fs'
import { inspect } from 'node:util'
import type { DiscordPayload } from '../src/model/DiscordApi.ts'
import type { BaseProvider } from '../src/provider/BaseProvider.ts'

/**
 * Helps with testing things
 */
class Tester {
    public static async test(
        provider: BaseProvider,
        jsonFileName: string | null = null,
        headers: any = null,
        query: any = null,
    ): Promise<DiscordPayload | null> {
        let requestBody = null
        if (jsonFileName != null) {
            requestBody = JSON.parse(Tester.readTestFile(provider, jsonFileName))
        }
        return Tester.testWithBody(provider, requestBody, headers, query)
    }

    public static async testWithBody(
        provider: BaseProvider,
        body: Record<string, any> | null = null,
        headers: any = null,
        query: any = null,
    ): Promise<DiscordPayload | null> {
        try {
            const res = await provider.parse(body, headers, query)
            console.log(inspect(res, false, null, true))
            return Promise.resolve(res)
        } catch (err) {
            console.error(err)
            return Promise.reject(err)
        }
    }

    public static readTestFile(provider: BaseProvider, fileName: string): string {
        const providerPath = provider.getPath().toLowerCase()
        const examplePath = `./examples/${providerPath}/${fileName}`
        const filePath = existsSync(examplePath) ? examplePath : `./test/${providerPath}/${fileName}`
        return readFileSync(filePath, 'utf-8')
    }
}

export { Tester }
