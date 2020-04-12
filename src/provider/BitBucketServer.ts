import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from './BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'

class BitBucketServer extends BaseProvider {
    private embed: Embed
    private baseLink: string

    private static _formatLargeString(str, limit = 256) {
        return (str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str)
    }

    private static _titleCase(str: string, ifNull = 'None') {
        if (str == null) {
            return ifNull
        }
        if (str.length < 1) {
            return str
        }
        const strArray = str.toLowerCase().split(' ')
        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].slice(1)
        }
        return strArray.join(' ')
    }

    constructor() {
        super()
        this.setEmbedColor(0x205081)
        this.embed = new Embed()
    }

    public getName() {
        return 'BitBucketServer'
    }

    public getType(): string {
        return this.headers['x-event-key']
    }

    public async diagnosticsPing() {
        const field = new EmbedField()
        this.embed.title = 'Test Connection'
        this.embed.description = `You have successfully configured Skyhook with your BitBucket Server instance.`
        field.name =  'Test'
        field.value = this.body.test
        this.embed.fields = [field]

        this.addEmbed(this.embed)
    }

    private extractBitbucketUrl(): string {
        return process.env.SERVER
    }
}

export { BitBucketServer }