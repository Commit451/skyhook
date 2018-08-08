import { DiscordPayload } from '../model/DiscordPayload'
import { Embed } from '../model/Embed'

/**
 * Error things
 */
class ErrorUtil {

    public static createErrorPayload(provider: string, error: Error): DiscordPayload {
        const payload = new DiscordPayload()
        const embed = new Embed()
        embed.title = `Skyhook Error`
        embed.url = 'https://github.com/Commit451/skyhook/issues'
        embed.description = `An error has occured on skyhook for your webhook with provider ${provider}. Maybe you can copy/paste or screenshot this error if there is no sensitive information and open an issue on the skyhook GitHub.\n\nError: ${JSON.stringify(error.stack)}`
        payload.embeds = []
        payload.embeds.push(embed)
        return payload
    }
}

export { ErrorUtil }
