import { Embed } from '../model/Embed'

/**
 * The data format needed for executing a webhook on Discord
 * https://discordapp.com/developers/docs/resources/webhook#execute-webhook
 */
class DiscordPayload {
    public content: any
    public username: string
    // tslint:disable-next-line:variable-name
    public avatar_url: string
    public tts: boolean
    public embeds: Embed[]
}
export { DiscordPayload }
