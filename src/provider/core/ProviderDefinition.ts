import type {
    EventProviderOptions,
    ProviderDefinition,
    ProviderExampleFiles,
    ProviderHttpPolicy,
} from './ProviderTypes.ts'

const PROVIDER_PATH_PATTERN = /^[a-z][a-z0-9-]*$/
const EXAMPLE_PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_./-]*\.json$/
const HTTP_HOST_PATTERN = /^(?:\[[0-9a-f:]+\]|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/
const MAX_EVENT_NAME_LENGTH = 256

export function defineProvider(definition: ProviderDefinition): ProviderDefinition {
    validateDefinition(definition)
    return Object.freeze({
        ...definition,
        example: Object.freeze({ ...definition.example }),
        defaults: definition.defaults == null ? undefined : Object.freeze({ ...definition.defaults }),
        http: freezeHttpPolicy(definition.http),
    })
}

export function defineEventProvider(options: EventProviderOptions): ProviderDefinition {
    const { event, handlers, fallback, ...provider } = options
    if ((typeof event !== 'string' || event.length === 0) && typeof event !== 'function') {
        throw new Error('Event provider selector must be a non-empty body key or a selector function.')
    }
    if (typeof fallback !== 'undefined' && typeof fallback !== 'function') {
        throw new Error('Event provider fallback must be a function.')
    }

    for (const [eventName, handler] of Object.entries(handlers)) {
        if (eventName.length === 0 || eventName.length > MAX_EVENT_NAME_LENGTH) {
            throw new Error(`Event provider handler key must contain 1-${MAX_EVENT_NAME_LENGTH} characters.`)
        }
        if (typeof handler !== 'function') {
            throw new Error(`Event provider handler for "${eventName}" must be a function.`)
        }
    }

    const frozenHandlers = Object.freeze({ ...handlers })
    return defineProvider({
        ...provider,
        async map(request, output): Promise<void> {
            const selected = typeof event === 'string' ? request.body[event] : event(request)
            if (typeof selected !== 'string' || selected.length === 0 || selected.length > MAX_EVENT_NAME_LENGTH) {
                output.ignore()
                return
            }
            const handler = frozenHandlers[selected] ?? fallback
            if (handler == null) {
                output.ignore()
                return
            }
            await handler(request, output)
        },
    })
}

function validateDefinition(definition: ProviderDefinition): void {
    if (!PROVIDER_PATH_PATTERN.test(definition.path)) {
        throw new Error(
            'Provider path must start with a lowercase letter and contain only lowercase letters, digits, or hyphens.',
        )
    }
    if (
        definition.name.trim() !== definition.name ||
        definition.name.length === 0 ||
        definition.name.length > 80 ||
        hasControlCharacters(definition.name)
    ) {
        throw new Error('Provider name must contain 1-80 printable characters without surrounding whitespace.')
    }
    validateExamplePath(definition.example.body, 'body')
    if (definition.example.headers != null) validateExamplePath(definition.example.headers, 'headers')
    if (definition.example.query != null) validateExamplePath(definition.example.query, 'query')
    if (typeof definition.map !== 'function') {
        throw new Error('Provider map must be a function.')
    }

    const { defaults } = definition
    if (defaults?.embedColor != null && !isDiscordColor(defaults.embedColor)) {
        throw new Error('Provider default embed color must be an integer between 0 and 0xffffff.')
    }
    validateHttpPolicy(definition.http)
}

function validateExamplePath(path: string, kind: keyof ProviderExampleFiles): void {
    if (path.trim().length === 0 || !EXAMPLE_PATH_PATTERN.test(path) || path.includes('..')) {
        throw new Error(`Provider example ${kind} must be a relative JSON fixture path.`)
    }
}

function validateHttpPolicy(policy: ProviderHttpPolicy | undefined): void {
    if (policy == null) return
    if (policy.allowedHosts.length === 0) {
        throw new Error('Provider HTTP policy must declare at least one allowed host.')
    }
    for (const host of policy.allowedHosts) {
        if (host !== host.toLowerCase() || !HTTP_HOST_PATTERN.test(host) || host.includes('..')) {
            throw new Error(`Provider HTTP host is invalid: ${host}`)
        }
    }
    if (policy.timeoutMs != null && (!Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs <= 0)) {
        throw new Error('Provider HTTP timeout must be a positive safe integer.')
    }
    if (
        policy.maxResponseBytes != null &&
        (!Number.isSafeInteger(policy.maxResponseBytes) || policy.maxResponseBytes <= 0)
    ) {
        throw new Error('Provider HTTP response size must be a positive safe integer.')
    }
}

function freezeHttpPolicy(policy: ProviderHttpPolicy | undefined): ProviderHttpPolicy | undefined {
    if (policy == null) return undefined
    return Object.freeze({
        ...policy,
        allowedHosts: Object.freeze([...policy.allowedHosts]),
    })
}

function isDiscordColor(value: number): boolean {
    return Number.isSafeInteger(value) && value >= 0 && value <= 0xffffff
}

function hasControlCharacters(value: string): boolean {
    return [...value].some((character) => {
        const codePoint = character.codePointAt(0)!
        return codePoint <= 0x1f || codePoint === 0x7f
    })
}
