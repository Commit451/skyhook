import { cleanText } from './DiscordText.ts'

const ISO_8601_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/

export function isRecord(value: unknown): value is Record<string, any> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
}

export function scalarText(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return null
    }
    if (
        typeof value === 'number' &&
        (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))
    ) {
        return null
    }
    const text = cleanText(String(value), false)
    return text.length === 0 ? null : text
}

export function firstScalar(...values: unknown[]): string | null {
    for (const value of values) {
        const text = scalarText(value)
        if (text != null) return text
    }
    return null
}

export function safeId(value: unknown, maxLength = Number.POSITIVE_INFINITY): string | null {
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) ? String(value) : null
    }
    if (typeof value !== 'string') {
        return null
    }
    const id = cleanText(value, true)
    return id.length > 0 && id.length <= maxLength ? id : null
}

export function safeIntegerText(value: unknown, positive = false): string | null {
    return Number.isSafeInteger(value) && (!positive || Number(value) > 0) ? String(value) : null
}

export function firstIso8601Timestamp(...values: unknown[]): string | null {
    for (const value of values) {
        const timestamp = canonicalizeIso8601Timestamp(value)
        if (timestamp != null) return timestamp
    }
    return null
}

export interface TrustedUrlPolicy {
    readonly allowedHosts: readonly string[]
    readonly allowSubdomains?: boolean
    readonly maxLength?: number
}

export function trustedHttpsUrl(value: unknown, policy: TrustedUrlPolicy): string | null {
    const maxLength = policy.maxLength ?? 2_048
    if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
        return null
    }
    try {
        const url = new URL(value)
        if (
            url.protocol !== 'https:' ||
            !isAllowedHostname(url.hostname, policy.allowedHosts, policy.allowSubdomains === true)
        ) {
            return null
        }
        return url.href.length <= maxLength ? url.href : null
    } catch {
        return null
    }
}

export function isAllowedHostname(hostname: string, allowedHosts: readonly string[], allowSubdomains = false): boolean {
    const normalized = hostname.toLowerCase()
    return allowedHosts.some((allowedHost) => {
        const allowed = allowedHost.toLowerCase()
        return normalized === allowed || (allowSubdomains && normalized.endsWith(`.${allowed}`))
    })
}

export function canonicalizeIso8601Timestamp(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null
    }
    const match = ISO_8601_TIMESTAMP.exec(value)
    if (match == null) {
        return null
    }

    const [, yearText, monthText, dayText, hourText, minuteText, secondText, fractionText, zone, sign] = match
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    const hour = Number(hourText)
    const minute = Number(minuteText)
    const second = Number(secondText)
    const millisecond = Number(`${fractionText ?? ''}000`.slice(0, 3))
    const offsetHour = zone === 'Z' ? 0 : Number(match[10])
    const offsetMinute = zone === 'Z' ? 0 : Number(match[11])
    if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour > 23 ||
        minute > 59 ||
        second > 59 ||
        offsetHour > 23 ||
        offsetMinute > 59
    ) {
        return null
    }

    const localDate = new Date(0)
    localDate.setUTCFullYear(year, month - 1, day)
    localDate.setUTCHours(hour, minute, second, millisecond)
    if (
        localDate.getUTCFullYear() !== year ||
        localDate.getUTCMonth() !== month - 1 ||
        localDate.getUTCDate() !== day ||
        localDate.getUTCHours() !== hour ||
        localDate.getUTCMinutes() !== minute ||
        localDate.getUTCSeconds() !== second
    ) {
        return null
    }

    const offsetSign = sign === '-' ? -1 : 1
    const offsetMilliseconds = offsetSign * (offsetHour * 60 + offsetMinute) * 60_000
    return new Date(localDate.getTime() - offsetMilliseconds).toISOString()
}
