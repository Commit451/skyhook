import { DateTime } from 'luxon'
import winston from 'winston'

/**
 * Helps with logging things. Basically a Winston helper
 */
class LoggerUtil {

    public static init(): void {
        if (!this.isInitialized) {
            winston.loggers.add('logger', {
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf((info) => `[${DateTime.local().toFormat('yyyy-MM-dd TT').trim()}] [${info.level}]: ${info.message}`)
                ),
                level: process.env.PRODUCTION ? 'info' : 'debug',
                transports: [
                    new winston.transports.Console()
                ]
            })
        }
    }

    public static logger(): winston.Logger {
        return winston.loggers.get('logger')
    }

    private static isInitialized = false
}

export { LoggerUtil }
