import type { ProviderOutput } from './ProviderOutput.ts'

export interface ProviderExampleFiles {
    readonly body: string
    readonly headers?: string
    readonly query?: string
}

export interface ProviderDefaults {
    readonly username?: string
    readonly avatarUrl?: string
    readonly embedColor?: number
}

export interface ProviderHttpPolicy {
    readonly allowedHosts: readonly string[]
    readonly timeoutMs?: number
    readonly maxResponseBytes?: number
}

export interface ProviderHttp {
    getJson<T = unknown>(url: string): Promise<T>
}

export interface ProviderRequest {
    readonly body: Record<string, any>
    readonly headers: Headers
    readonly query: URLSearchParams
    readonly http: ProviderHttp
}

export interface ProviderRunInput {
    readonly body: unknown
    readonly headers?: unknown
    readonly query?: unknown
}

export type ProviderMapper = (request: ProviderRequest, output: ProviderOutput) => void | Promise<void>

export interface ProviderDefinition {
    readonly path: string
    readonly name: string
    readonly example: ProviderExampleFiles
    readonly defaults?: ProviderDefaults
    readonly http?: ProviderHttpPolicy
    readonly map: ProviderMapper
}

export interface EventProviderOptions extends Omit<ProviderDefinition, 'map'> {
    readonly event: string | ((request: ProviderRequest) => string | null)
    readonly handlers: Readonly<Record<string, ProviderMapper>>
    readonly fallback?: ProviderMapper
}
