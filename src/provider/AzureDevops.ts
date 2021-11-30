import { Embed, EmbedField, EmbedAuthor } from '../model/DiscordApi'
import { TypeParseProvder } from './BaseProvider'

export class AzureDevops extends TypeParseProvder {

    private embed: Embed

    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = {}
    }

    public getName(): string {
        return 'Azure-DevOps'
    }

    public getType(): string | null {
        return this.body.eventType
    }

    public knownTypes(): string[] {
        return ['gitPush']
    }

    public async gitPush(): Promise<void> {
        this.logger.debug('Parsing git push event')
        this.embed.title = this.body.message.markdown
        this.embed.description = this.body.detailedMessage.markdown
        this.embed.url = this.body.resource.repository.url

        this.embed.author = this.extractAuthor()

        this.addEmbed(this.embed)
    }

    public extractAuthor(): EmbedAuthor {
        return {
            name: this.body.resource.pushedBy.displayName,
        }
    }
}