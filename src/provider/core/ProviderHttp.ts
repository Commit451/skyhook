import { isAllowedHostname } from '../../util/WebhookValue.ts'
import type { ProviderHttp, ProviderHttpPolicy } from './ProviderTypes.ts'

const DEFAULT_TIMEOUT_MS = 5_000
const MAX_TIMEOUT_MS = 10_000
const DEFAULT_RESPONSE_BYTES = 256_000
const MAX_RESPONSE_BYTES = 1_000_000

export function createProviderHttp(policy: ProviderHttpPolicy | undefined): ProviderHttp {
    return Object.freeze({
        async getJson<T = unknown>(url: string): Promise<T> {
            if (policy == null) throw new Error('This provider is not permitted to make HTTP requests.')

            const target = parseTarget(url, policy)
            const timeoutMs = Math.min(policy.timeoutMs ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS)
            const maxResponseBytes = Math.min(policy.maxResponseBytes ?? DEFAULT_RESPONSE_BYTES, MAX_RESPONSE_BYTES)
            const response = await fetch(target, {
                headers: { accept: 'application/json' },
                redirect: 'error',
                signal: AbortSignal.timeout(timeoutMs),
            })
            if (!response.ok) {
                throw new Error(`Provider HTTP request failed with status ${response.status}.`)
            }

            const declaredLength = Number(response.headers.get('content-length'))
            if (Number.isFinite(declaredLength) && declaredLength > maxResponseBytes) {
                await response.body?.cancel()
                throw sizeLimitError()
            }

            return JSON.parse(await readBoundedText(response, maxResponseBytes)) as T
        },
    })
}

function parseTarget(url: string, policy: ProviderHttpPolicy): URL {
    let target: URL
    try {
        target = new URL(url)
    } catch {
        throw new Error('Provider HTTP URL is invalid.')
    }
    if (target.protocol !== 'https:') throw new Error('Provider HTTP requests must use HTTPS.')
    if (target.username.length > 0 || target.password.length > 0) {
        throw new Error('Provider HTTP URLs must not contain credentials.')
    }
    if (target.port.length > 0) throw new Error('Provider HTTP URLs must use the default HTTPS port.')
    if (!isAllowedHostname(target.hostname, policy.allowedHosts)) {
        throw new Error(`Provider HTTP host is not allowed: ${target.hostname}`)
    }
    return target
}

async function readBoundedText(response: Response, maxResponseBytes: number): Promise<string> {
    if (response.body == null) return ''

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let totalBytes = 0
    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            totalBytes += value.byteLength
            if (totalBytes > maxResponseBytes) {
                await reader.cancel()
                throw sizeLimitError()
            }
            chunks.push(value)
        }
    } finally {
        reader.releaseLock()
    }

    const body = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
        body.set(chunk, offset)
        offset += chunk.byteLength
    }
    return new TextDecoder().decode(body)
}

function sizeLimitError(): Error {
    return new Error('Provider HTTP response exceeds the configured size limit.')
}
