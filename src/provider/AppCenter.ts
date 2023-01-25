import { Embed } from '../model/DiscordApi'
import { TypeParseProvider } from '../provider/BaseProvider'

/**
 * https://learn.microsoft.com/en-us/appcenter/dashboard/webhooks/
 */
export class AppCenter extends TypeParseProvider {
    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0xCB2E62)
        this.embed = {}
    }

    public getName(): string {
        return 'AppCenter'
    }

    public getType(): string | null {
        if (this.body.build_status) {
            return 'pipeline'
        }

        if (this.body.release_id) {
            return 'distribute'
        }

        return null
    }

    public knownTypes(): string[] {
        return [
            'pipeline',
            'distribute'
        ]
    }

    private getEmojiStatus(status: string): string {
        switch (status) {
            case 'Canceled': return '🚫'
            case 'Failed': return '❌'
            case 'Succeeded': return '✅'
            case 'SucceededWithIssues': return '⚠️'
            default: return ''
        }
    }

    public async pipeline(): Promise<void> {
        this.embed.title = 'Pipeline #' + this.body.build_id + ' on ' + this.body.app_name
        this.embed.url = this.body.build_link
        this.embed.description = `**Status**: ${this.body.build_status} ${this.getEmojiStatus(this.body.build_status)}` 
        this.addEmbed(this.embed)
    }

    public async distribute(): Promise<void> {
        const information: string[] = [
            `**Version**: ${this.body.short_version} (${this.body.version})`,
            `**Platform**: ${this.body.platform}`
        ]

        if (this.body.release_notes) {
            information.push( `**Release notes**: ${this.body.release_notes}`)
        }

        this.embed.title = 'Distribute #' + this.body.release_id + ' on ' + this.body.app_name
        this.embed.url = this.body.install_link
        this.embed.description = information.join('\n')
        this.addEmbed(this.embed)
    }
}
