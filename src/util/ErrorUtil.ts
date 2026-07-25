import type { DiscordPayload } from '../model/DiscordApi.ts'

/**
 * Builds the safe Discord-facing payload for an internal parse failure.
 */
export class ErrorUtil {
    public static createErrorPayload(provider: string, _error: unknown): DiscordPayload {
        return {
            embeds: [
                {
                    title: 'Skyhook Error',
                    url: 'https://github.com/Commit451/skyhook/issues',
                    description: `An error occurred in Skyhook while processing your webhook for provider ${provider}. Internal error and request details are only recorded in the server logs. Please open an issue on the Skyhook GitHub if the problem continues.`,
                },
            ],
        }
    }
}
