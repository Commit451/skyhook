import { existsSync, readFileSync } from 'node:fs'
import type { DiscordPayload } from '../src/model/DiscordApi.ts'
import { executeProvider, type ProviderDefinition } from '../src/provider/Provider.ts'

/** Helps execute provider definitions against fixtures. */
class Tester {
    public static async test(
        provider: ProviderDefinition,
        jsonFileName: string | null = null,
        headers: unknown = null,
        query: unknown = null,
    ): Promise<DiscordPayload | null> {
        const body = jsonFileName == null ? null : JSON.parse(Tester.readTestFile(provider, jsonFileName))
        return Tester.testWithBody(provider, body, headers, query)
    }

    public static async testWithBody(
        provider: ProviderDefinition,
        body: Record<string, any> | null = null,
        headers: unknown = null,
        query: unknown = null,
    ): Promise<DiscordPayload | null> {
        return executeProvider(provider, { body, headers, query })
    }

    public static readTestFile(provider: ProviderDefinition, fileName: string): string {
        const providerPath = provider.path.toLowerCase()
        const examplePath = `./examples/${providerPath}/${fileName}`
        const filePath = existsSync(examplePath) ? examplePath : `./test/${providerPath}/${fileName}`
        return readFileSync(filePath, 'utf-8')
    }
}

export { Tester }
