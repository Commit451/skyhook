const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
type LogLevel = keyof typeof LEVELS

const SEVERITY: Record<LogLevel, string> = {
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
}

const COLORS: Record<LogLevel, string> = {
    debug: '\x1b[34m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
}
const RESET = '\x1b[0m'

const isStructured = Boolean(process.env.K_SERVICE)
const minLevel: LogLevel = process.env.PRODUCTION ? 'info' : 'debug'

function messageString(message: unknown): string {
    if (message instanceof Error) return message.stack ?? message.message
    if (typeof message === 'string') return message
    return String(message)
}

function emit(level: LogLevel, message: unknown): void {
    if (LEVELS[level] < LEVELS[minLevel]) return
    const text = messageString(message)
    const line = isStructured
        ? JSON.stringify({ severity: SEVERITY[level], message: text })
        : `[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] [${COLORS[level]}${level}${RESET}]: ${text}`
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout
    stream.write(line + '\n')
}

export const logger = {
    debug: (m: unknown): void => emit('debug', m),
    info: (m: unknown): void => emit('info', m),
    warn: (m: unknown): void => emit('warn', m),
    error: (m: unknown): void => emit('error', m),
}

export type Logger = typeof logger
