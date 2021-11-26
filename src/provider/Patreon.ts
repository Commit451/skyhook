import { Embed } from '../model/DiscordApi'
import { TypeParseProvder } from '../provider/BaseProvider'

enum PatreonAction {
    CREATE,
    UPDATE,
    DELETE
}

/**
 * https://docs.patreon.com/#webhooks
 */
export class Patreon extends TypeParseProvder {

    // HTML Regular Expressions
    private static boldRegex = /<strong>(.*?)<\/strong>/
    private static italicRegex = /<em>(.*?)<\/em>/
    private static underlineRegex = /<u>(.*?)<\/u>/
    private static anchorRegex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/
    private static ulRegex = /<ul>(.*?)<\/ul>/
    private static liRegex = /<li>(.*?)<\/li>/
    private static imageRegex = /<img.*src="(.*?)">/

    private static _formatHTML(html: string, baseLink: string): string {
        const newLineRegex = /<br>/g
        // Match lists
        while (this.ulRegex.test(html)) {
            const match = this.ulRegex.exec(html)!
            html = html.replace(this.ulRegex, match[1])
            let str = match[1]
            while (this.liRegex.test(str)) {
                const match2 = this.liRegex.exec(match[1])!
                str = str.replace(match2[0], '')
                html = html.replace(this.liRegex, '\uFEFF\u00A0\u00A0\u00A0\u00A0\u2022 ' + match2[1] + '\n')
            }
        }
        // Match bold
        while (this.boldRegex.test(html)) {
            const match = this.boldRegex.exec(html)!
            html = html.replace(this.boldRegex, '**' + match[1] + '**')
        }
        // Match Italic
        while (this.italicRegex.test(html)) {
            const match = this.italicRegex.exec(html)!
            html = html.replace(this.italicRegex, '_' + match[1] + '_')
        }
        // Replace Underlined
        while (this.underlineRegex.test(html)) {
            const match = this.underlineRegex.exec(html)!
            html = html.replace(this.underlineRegex, '__' + match[1] + '__')
        }
        // Replace Anchors
        while (this.anchorRegex.test(html)) {
            const match = this.anchorRegex.exec(html)!
            const url = match[1].startsWith('#') ? baseLink + match[1] : match[1]
            html = html.replace(this.anchorRegex, '[' + match[2] + '](' + url + ')')
        }
        // Replace Images
        while (this.imageRegex.test(html)) {
            const match = this.imageRegex.exec(html)!
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

    public getName(): string {
        return 'Patreon'
    }

    public getType(): string | null {
        return this.headers['x-patreon-event']
    }

    public knownTypes(): string[] {
        return [
            'membersCreate',
            'membersUpdate',
            'membersDelete',
            'membersPledgeCreate',
            'membersPledgeUpdate',
            'membersPledgeDelete',
            'pledgesCreate',
            'pledgesUpdate',
            'pledgesDelete'
        ]
    }

    private _handleAPIV2(type: PatreonAction): void {
        const embed: Embed = {}
        const campaignId = this.body.data.relationships.campaign?.data?.id
        const patronId = this.body.data.relationships.user?.data?.id

        // TODO Test endpoint may be returning incomplete data.
        // Does not provide a way to get the reward without keying off of amount_cents.
        // Keep an eye on data.relationships.currently_entitled_tiers
        // For now, find closest tier that is below or at the cents value.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rewards = (this.body.included as any[])
            .filter(val => val.type === 'reward' && val.attributes.published && val.attributes.amount_cents <= this.body.data.attributes.pledge_amount_cents)
        const reward = rewards.length > 0 ? rewards.reduce((a, b) => {
            const max = Math.max(a.attributes.amount_cents, b.attributes.amount_cents)
            return max === a.attributes.amount_cents ? a : b
        }) : null

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
                embed.author = {
                    name: entry.attributes.full_name,
                    icon_url: entry.attributes.thumb_url,
                    url: entry.attributes.url
                }
            }
        }

        if (reward != null && type !== PatreonAction.DELETE) {
            embed.fields = [{
                name: 'Unlocked Tier',
                value: `[${reward.attributes.title} ($${(reward.attributes.amount_cents / 100).toFixed(2)}+/mo)](https://www.patreon.com${reward.attributes.url})\n${Patreon._formatHTML(reward.attributes.description, embed.url!)}`,
                inline: false
            }]
        }
        this.addEmbed(embed)

    }

    private async membersCreate(): Promise<void> {
        this._handleAPIV2(PatreonAction.CREATE)
    }

    private async membersUpdate(): Promise<void> {
        this._handleAPIV2(PatreonAction.UPDATE)
    }

    private async membersDelete(): Promise<void> {
        this._handleAPIV2(PatreonAction.DELETE)
    }

    private async membersPledgeCreate(): Promise<void> {
        this._handleAPIV2(PatreonAction.CREATE)
    }

    private async membersPledgeUpdate(): Promise<void> {
        this._handleAPIV2(PatreonAction.UPDATE)
    }

    private async membersPledgeDelete(): Promise<void> {
        this._handleAPIV2(PatreonAction.DELETE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private _createUpdateCommon(type: PatreonAction): void {
        const embed: Embed = {}
        const campaignId = this.body.data.relationships.campaign?.data?.id
        const patronId = this.body.data.relationships.patron?.data?.id
        const rewardId = this.body.data.relationships.reward?.data?.id

        const incl = this.body.included
        // This is deprecated, don't care.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let reward: any = null

        // This is deprecated, don't care.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        incl.forEach((attr: any) => {
            if (attr.id === campaignId) {
                const dollarAmount = (this.body.data.attributes.amount_cents / 100).toFixed(2)
                if (type === PatreonAction.DELETE) {
                    embed.title = `Canceled $${dollarAmount} Pledge`
                } else {
                    embed.title = `Pledged $${dollarAmount}`
                }
                embed.url = attr.attributes.url
            } else if (attr.id === patronId) {
                embed.author = {
                    name: attr.attributes.full_name,
                    icon_url: attr.attributes.thumb_url,
                    url: attr.attributes.url
                }
            } else if (attr.id === rewardId) {
                reward = attr
            }
        })
        if (reward != null && type !== PatreonAction.DELETE) {
            embed.fields = [{
                name: 'Unlocked Tier',
                value: `[${reward.attributes.title} ($${(reward.attributes.amount_cents / 100).toFixed(2)}+/mo)](https://www.patreon.com${reward.attributes.url})\n${Patreon._formatHTML(reward.attributes.description, embed.url!)}`,
                inline: false
            }]
        }
        this.addEmbed(embed)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesCreate(): Promise<void> {
        this._createUpdateCommon(PatreonAction.CREATE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesUpdate(): Promise<void> {
        this._createUpdateCommon(PatreonAction.UPDATE)
    }

    /**
     * @deprecated Patreon v1 API
     */
    private async pledgesDelete(): Promise<void> {
        this._createUpdateCommon(PatreonAction.DELETE)
    }

}
