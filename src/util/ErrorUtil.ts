import { DiscordPayload } from '../model/DiscordPayload'

/**
 * Error things
 */
class ErrorUtil {

    public static createErrorPayload(provider: string, error: Error): DiscordPayload {
        const payload = new DiscordPayload()
        payload.content = `An error has occured on skyhook for your webhook with provider ${provider}. Maybe you can screenshot this error and open an issue on the skyhook GitHub. Error: ${JSON.stringify(error.stack)}`
        return payload
    }
}

export { ErrorUtil }
