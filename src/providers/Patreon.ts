import { Embed } from "../model/Embed"
import { EmbedAuthor } from "../model/EmbedAuthor"
import { EmbedField } from "../model/EmbedField"
import { BaseProvider } from "../util/BaseProvider"

/**
 * https://www.patreon.com/platform/documentation/webhooks
 */
class Patreon extends BaseProvider {

    public static getName() {
        return 'Patreon'
    }

    // HTML Regular Expressions
    private static boldRegex = /<strong>(.*?)<\/strong>/
    private static italicRegex = /<em>(.*?)<\/em>/
    private static underlineRegex = /<u>(.*?)<\/u>/
    private static anchorRegex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/
    private static ulRegex = /<ul>(.*?)<\/ul>/
    private static liRegex = /<li>(.*?)<\/li>/
    private static imageRegex = /<img.*src="(.*?)">/

    private static _formatHTML(html, baseLink) {
        const newLineRegex = /<br>/g
        // Match lists
        while (this.ulRegex.test(html)) {
            const match = this.ulRegex.exec(html)
            html = html.replace(this.ulRegex, match[1])
            let str = match[1]
            while (this.liRegex.test(str)) {
                const match2 = this.liRegex.exec(match[1])
                str = str.replace(match2[0], '')
                html = html.replace(this.liRegex, '\uFEFF\u00A0\u00A0\u00A0\u00A0\u2022 ' + match2[1] + '\n')
            }
        }
        // Match bold
        while (this.boldRegex.test(html)) {
            const match = this.boldRegex.exec(html)
            html = html.replace(this.boldRegex, '**' + match[1] + '**')
        }
        // Match Italic
        while (this.italicRegex.test(html)) {
            const match = this.italicRegex.exec(html)
            html = html.replace(this.italicRegex, '_' + match[1] + '_')
        }
        // Replace Underlined
        while (this.underlineRegex.test(html)) {
            const match = this.underlineRegex.exec(html)
            html = html.replace(this.underlineRegex, '__' + match[1] + '__')
        }
        // Replace Anchors
        while (this.anchorRegex.test(html)) {
            const match = this.anchorRegex.exec(html)
            const url = match[1].startsWith('#') ? baseLink + match[1] : match[1]
            html = html.replace(this.anchorRegex, '[' + match[2] + '](' + url + ')')
        }
        // Replace Images
        while (this.imageRegex.test(html)) {
            const match = this.imageRegex.exec(html)
            html = html.replace(this.imageRegex, '[View Image..](' + match[1] + ')')
        }
        // Replace all br tags
        html = html.replace(newLineRegex, '\n')
        return html
    }

    constructor() {
        super()
        this.setEmbedColor(0xF96854)
    }

    protected getType(): string {
        return this.req.get('X-Patreon-Event')
    }

    private _createUpdateCommon(type) {
        const embed = new Embed()
        const createorId = this.body.data.relationships.creator && this.body.data.relationships.creator.data && this.body.data.relationships.creator.data.id
        const patreonId = this.body.data.relationships.patron && this.body.data.relationships.patron.data && this.body.data.relationships.patron.data.id
        const rewardId = this.body.data.relationships.reward && this.body.data.relationships.reward.data && this.body.data.relationships.reward.data.id

        const incl = this.body.included
        let reward = null
        incl.forEach((attr: any) => {
            if (attr.id === createorId) {
                if (type === 'delete') {
                    embed.title = 'Canceled $' + (this.body.data.attributes.amount_cents / 100).toFixed(2) + ' pledge to ' + attr.attributes.full_name
                } else {
                    embed.title = 'Pledged $' + (this.body.data.attributes.amount_cents / 100).toFixed(2) + ' to ' + attr.attributes.full_name
                }
                embed.url = attr.attributes.url
            } else if (attr.id === patreonId) {
                const author = new EmbedAuthor()
                author.name = attr.attributes.full_name
                author.iconUrl = attr.attributes.thumb_url
                author.url = attr.attributes.url
                embed.author = author
            } else if (attr.id === rewardId) {
                reward = attr
            }
        })
        if (reward != null) {
            const field = new EmbedField()
            field.name = 'Unlocked \'' + reward.attributes.title + '\''
            field.value = '[$' + (reward.attributes.amount_cents / 100).toFixed(2) + '+ per month](https://www.patreon.com' + reward.attributes.url + ')\n' + Patreon._formatHTML(reward.attributes.description, embed.url)
            field.inline = false
            embed.description = '---'
            if (type === 'delete') {
                field.name = 'Lost \'' + reward.attributes.title + '\''
            }
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    private async pledgesCreate() {
        this._createUpdateCommon('create')
    }

    private async pledgesUpdate() {
        this._createUpdateCommon('update')
    }

    private async pledgesDelete() {
        this._createUpdateCommon('delete')
    }

}

module.exports = Patreon
