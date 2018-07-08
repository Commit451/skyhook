import { EmbedAuthor } from './EmbedAuthor'
import { EmbedField } from './EmbedField'
import { EmbedFooter } from './EmbedFooter'
import { EmbedImage } from './EmbedImage'

/**
 * https://discordapp.com/developers/docs/resources/channel#embed-object-embed-structure
 */
class Embed {
    public title: string
    public type: string
    public description: string
    public url: string
    public timestamp: string
    public color: number
    public footer: EmbedFooter
    public fields: EmbedField[]
    public author: EmbedAuthor
    public image: EmbedImage
}

export { Embed }
