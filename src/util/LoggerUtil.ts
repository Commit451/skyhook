import { DateTime } from 'luxon'
import winston from 'winston'

/**
 * Helps with logging things. Basically a Winston helper
 */
class LoggerUtil {

    public static init() {
        if (!this.isInitialized) {
            // @ts-ignore Method exists, will be added to ts def in next release.
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

    public static logger() {
        // @ts-ignore Method exists, will be added to ts def in next release.
        return winston.loggers.get('logger')
    }

    private static isInitialized = false
}

export { LoggerUtil }
