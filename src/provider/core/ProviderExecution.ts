import { isRecord } from '../../util/WebhookValue.ts'
import { createProviderHttp } from './ProviderHttp.ts'
import { ProviderOutput } from './ProviderOutput.ts'
import type { ProviderDefinition, ProviderRequest, ProviderRunInput } from './ProviderTypes.ts'

export async function executeProvider(
    definition: ProviderDefinition,
    input: ProviderRunInput,
): Promise<ReturnType<ProviderOutput['finish']>> {
    if (!isRecord(input.body)) return null

    const request: ProviderRequest = {
        body: input.body,
        headers: normalizeHeaders(input.headers),
        query: normalizeQuery(input.query),
        http: createProviderHttp(definition.http),
    }
    const output = new ProviderOutput(definition.defaults)
    await definition.map(request, output)
    return output.finish()
}

function normalizeHeaders(value: unknown): Headers {
    if (value instanceof Headers) return new Headers(value)

    const headers = new Headers()
    if (!isRecord(value)) return headers
    for (const [name, headerValue] of Object.entries(value)) {
        if (headerValue == null) continue
        if (Array.isArray(headerValue)) {
            for (const item of headerValue) headers.append(name, String(item))
        } else {
            headers.set(name, String(headerValue))
        }
    }
    return headers
}

function normalizeQuery(value: unknown): URLSearchParams {
    if (value instanceof URLSearchParams) return new URLSearchParams(value)

    const query = new URLSearchParams()
    if (!isRecord(value)) return query
    for (const [name, queryValue] of Object.entries(value)) {
        if (queryValue == null) continue
        if (Array.isArray(queryValue)) {
            for (const item of queryValue) query.append(name, String(item))
        } else {
            query.set(name, String(queryValue))
        }
    }
    return query
}
