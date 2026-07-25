const ISO_8601_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/

export function isRecord(value: unknown): value is Record<string, any> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
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
