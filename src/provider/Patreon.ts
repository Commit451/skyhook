import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../provider/BaseProvider'

enum PatreonAction {
    CREATE,
    UPDATE,
    DELETE
}

/**
 * https://docs.patreon.com/#webhooks
 */
class Patreon extends BaseProvider {

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

    public getName() {
        return 'Patreon'
    }

    public getType(): string {
        return this.headers['x-patreon-event']
    }

    private _handleAPIV2(type: PatreonAction) {
        const embed = new Embed()
        const campaignId = this.body.data.relationships.campaign?.data?.id
        const patronId = this.body.data.relationships.user?.data?.id

        // TODO Test endpoint may be returning incomplete data.
        // Does not provide a way to get the reward without keying off of amount_cents.
        // Keep an eye on data.relationships.currently_entitled_tiers
        // For now, find closest tier that is below or at the cents value.
        const reward = (this.body.included as any[])
        .filter(val => val.type === 'reward' && val.attributes.published && val.attributes.amount_cents <= this.body.data.attributes.pledge_amount_cents)
        .reduce((a, b) => Math.max(a.attributes.amount_cents, b.attributes.amount_cents))

        for (const entry of this.body.included) {
            if (entry.type === 'campaign' && entry.id === campaignId) {
                const dollarAmount = (this.body.data.attributes.pledge_amount_cents / 100).toFixed(2)
                if (type === PatreonAction.DELETE) {
                    embed.title = `Canceled $${dollarAmount} Pledge`
                } else {
                    embed.title = `Pledged $${dollarAmount}`
                }
                embed.url = entry.attributes.url
            } else if (entry.type === 'user' && entry.id === patronId) {
                const author = new EmbedAuthor()
                author.name = entry.attributes.full_name
                author.icon_url = entry.attributes.thumb_url
                author.url = entry.attributes.url
                embed.author = author
            }
        }

        if (reward != null && type !== PatreonAction.DELETE) {
            const field = new EmbedField()
            field.name = 'Unlocked Tier'
            field.value = `[${reward.attributes.title} ($${(reward.attributes.amount_cents / 100).toFixed(2)}+/mo)](https://www.patreon.com${reward.attributes.url})\n${Patreon._formatHTML(reward.attributes.description, embed.url)}`
            field.inline = false
            embed.fields = [field]
        }
        this.addEmbed(embed)

    }

    private async membersCreate() {
        this._handleAPIV2(PatreonAction.CREATE)
    }

    private async membersUpdate() {
        this._handleAPIV2(PatreonAction.UPDATE)
    }

    private async membersDelete() {
        this._handleAPIV2(PatreonAction.DELETE)
    }

    private async membersPledgeCreate() {
        this._handleAPIV2(PatreonAction.CREATE)
    }

    private async membersPledgeUpdate() {
        this._handleAPIV2(PatreonAction.UPDATE)
    }

    private async membersPledgeDelete() {
        this._handleAPIV2(PatreonAction.DELETE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private _createUpdateCommon(type: PatreonAction) {
        const embed = new Embed()
        const createorId = this.body.data.relationships.campaign?.data?.id
        const patreonId = this.body.data.relationships.patron?.data?.id
        const rewardId = this.body.data.relationships.reward?.data?.id

        const incl = this.body.included
        let reward = null
        incl.forEach((attr: any) => {
            if (attr.id === createorId) {
                const dollarAmount = (this.body.data.attributes.amount_cents / 100).toFixed(2)
                if (type === PatreonAction.DELETE) {
                    embed.title = `Canceled $${dollarAmount} Pledge`
                } else {
                    embed.title = `Pledged $${dollarAmount}`
                }
                embed.url = attr.attributes.url
            } else if (attr.id === patreonId) {
                const author = new EmbedAuthor()
                author.name = attr.attributes.full_name
                author.icon_url = attr.attributes.thumb_url
                author.url = attr.attributes.url
                embed.author = author
            } else if (attr.id === rewardId) {
                reward = attr
            }
        })
        if (reward != null && type !== PatreonAction.DELETE) {
            const field = new EmbedField()
            field.name = 'Unlocked Tier'
            field.value = `[${reward.attributes.title} ($${(reward.attributes.amount_cents / 100).toFixed(2)}+/mo)](https://www.patreon.com${reward.attributes.url})\n${Patreon._formatHTML(reward.attributes.description, embed.url)}`
            field.inline = false
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesCreate() {
        this._createUpdateCommon(PatreonAction.CREATE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesUpdate() {
        this._createUpdateCommon(PatreonAction.UPDATE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesDelete() {
        this._createUpdateCommon(PatreonAction.DELETE)
    }

}

export { Patreon }
