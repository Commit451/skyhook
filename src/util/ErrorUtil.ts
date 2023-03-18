import { DiscordPayload } from '../model/DiscordApi.js'

/**
 * Error things
 */
export class ErrorUtil {

    public static createErrorPayload(provider: string, error: Error): DiscordPayload {
        return {
            embeds: [
                {
                    title: 'Skyhook Error',
                    url: 'https://github.com/Commit451/skyhook/issues',
                    description: `An error has occured on skyhook for your webhook with provider ${provider}. Maybe you can copy/paste or screenshot this error if there is no sensitive information and open an issue on the skyhook GitHub.\n\nError: ${JSON.stringify(error.stack)}`
                }
            ]
        }
    }
}
