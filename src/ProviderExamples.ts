import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type ProviderRegistry, providerRegistry } from './provider/ProviderRegistry.ts'

export type ProviderExample = {
    body: Record<string, unknown>
    headers: Record<string, string> | null
    query: Record<string, string>
}

const examplesRoot = fileURLToPath(new URL('../examples/', import.meta.url))

export const providerExamplePaths = Object.freeze(providerRegistry.definitions.map(({ path }) => path))

export function loadProviderExample(
    providerPath: string,
    registry: ProviderRegistry = providerRegistry,
): ProviderExample {
    const files = registry.get(providerPath)?.example
    if (files == null) {
        throw new Error(`No example payload is registered for provider ${providerPath}.`)
    }

    return {
        body: readJson<Record<string, unknown>>(files.body),
        headers: files.headers == null ? null : readJson<Record<string, string>>(files.headers),
        query: files.query == null ? {} : readJson<Record<string, string>>(files.query),
    }
}

function readJson<T extends Record<string, unknown>>(relativePath: string): T {
    const absolutePath = resolve(examplesRoot, relativePath)
    return JSON.parse(readFileSync(absolutePath, 'utf-8')) as T
}
