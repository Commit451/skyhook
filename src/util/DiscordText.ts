export function cleanText(value: string, singleLine: boolean): string {
    let cleaned = Array.from(value.replace(/\r\n?/g, '\n'))
        .filter((character) => {
            const code = character.charCodeAt(0)
            return code === 9 || code === 10 || (code > 31 && code !== 127)
        })
        .join('')
        .trim()
    if (singleLine) {
        cleaned = cleaned.replace(/\s+/g, ' ')
    }
    return cleaned
}

export function truncateText(value: string, maxLength: number, singleLine: boolean): string {
    const cleaned = cleanText(value, singleLine)
    if (cleaned.length <= maxLength) {
        return cleaned
    }
    if (maxLength <= 1) {
        return '…'.slice(0, maxLength)
    }
    return `${cleaned.slice(0, maxLength - 1)}…`
}

export function escapeDiscordMarkdownLiteral(value: string): string {
    return value.replace(/([\\`*_{}[\]()<>#+!|~])/g, '\\$1')
}

export function humanizeWords(value: string): string {
    const words = cleanText(value, true)
        .replace(/[._-]+/g, ' ')
        .toLowerCase()
    return words.length === 0 ? '' : words.charAt(0).toUpperCase() + words.slice(1)
}
