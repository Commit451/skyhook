import { EmbedAuthor } from "./EmbedAuthor"
import { EmbedField } from "./EmbedField"
import { EmbedFooter } from "./EmbedFooter"

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
}

export { Embed }
