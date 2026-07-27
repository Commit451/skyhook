import type { Embed } from '../model/DiscordApi.ts'
import { defineEventProvider } from './Provider.ts'

const PatreonAction = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
} as const
type PatreonAction = (typeof PatreonAction)[keyof typeof PatreonAction]

const boldRegex = /<strong>(.*?)<\/strong>/
const italicRegex = /<em>(.*?)<\/em>/
const underlineRegex = /<u>(.*?)<\/u>/
const anchorRegex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/
const ulRegex = /<ul>(.*?)<\/ul>/
const liRegex = /<li>(.*?)<\/li>/
const imageRegex = /<img.*src="(.*?)">/

/**
 * https://docs.patreon.com/#webhooks
 */
export const Patreon = defineEventProvider({
    path: 'patreon',
    name: 'Patreon',
    example: {
        body: 'patreon/patreon-member-create.json',
        headers: 'patreon/patreon.headers.json',
    },
    defaults: { embedColor: 0xf96854 },
    event: ({ headers }) => headers.get('x-patreon-event'),
    handlers: {
        'members:create': apiV2Handler(PatreonAction.CREATE),
        'members:update': apiV2Handler(PatreonAction.UPDATE),
        'members:delete': apiV2Handler(PatreonAction.DELETE),
        'members:pledge:create': apiV2Handler(PatreonAction.CREATE),
        'members:pledge:update': apiV2Handler(PatreonAction.UPDATE),
        'members:pledge:delete': apiV2Handler(PatreonAction.DELETE),
        'pledges:create': apiV1Handler(PatreonAction.CREATE),
        'pledges:update': apiV1Handler(PatreonAction.UPDATE),
        'pledges:delete': apiV1Handler(PatreonAction.DELETE),
    },
})

function apiV2Handler(type: PatreonAction) {
    return ({ body }: { body: Record<string, any> }, output: { addEmbed(embed: Embed): void }): void => {
        output.addEmbed(handleApiV2(body, type))
    }
}

function apiV1Handler(type: PatreonAction) {
    return ({ body }: { body: Record<string, any> }, output: { addEmbed(embed: Embed): void }): void => {
        output.addEmbed(handleApiV1(body, type))
    }
}

function handleApiV2(body: Record<string, any>, type: PatreonAction): Embed {
    const embed: Embed = {}
    const campaignId = body.data.relationships.campaign?.data?.id
    const patronId = body.data.relationships.user?.data?.id
    const rewards = (body.included as any[]).filter(
        (value) =>
            value.type === 'reward' &&
            value.attributes.published &&
            value.attributes.amount_cents <= body.data.attributes.pledge_amount_cents,
    )
    const reward =
        rewards.length === 0
            ? null
            : rewards.reduce((a, b) => (a.attributes.amount_cents >= b.attributes.amount_cents ? a : b))

    for (const entry of body.included) {
        if (entry.type === 'campaign' && entry.id === campaignId) {
            const dollarAmount = (body.data.attributes.pledge_amount_cents / 100).toFixed(2)
            embed.title =
                type === PatreonAction.DELETE ? `Canceled $${dollarAmount} Pledge` : `Pledged $${dollarAmount}`
            embed.url = entry.attributes.url
        } else if (entry.type === 'user' && entry.id === patronId) {
            embed.author = {
                name: entry.attributes.full_name,
                icon_url: entry.attributes.thumb_url,
                url: entry.attributes.url,
            }
        }
    }

    addRewardField(embed, reward, type)
    return embed
}

function handleApiV1(body: Record<string, any>, type: PatreonAction): Embed {
    const embed: Embed = {}
    const campaignId = body.data.relationships.campaign?.data?.id
    const patronId = body.data.relationships.patron?.data?.id
    const rewardId = body.data.relationships.reward?.data?.id
    let reward: any = null

    for (const entry of body.included) {
        if (entry.id === campaignId) {
            const dollarAmount = (body.data.attributes.amount_cents / 100).toFixed(2)
            embed.title =
                type === PatreonAction.DELETE ? `Canceled $${dollarAmount} Pledge` : `Pledged $${dollarAmount}`
            embed.url = entry.attributes.url
        } else if (entry.id === patronId) {
            embed.author = {
                name: entry.attributes.full_name,
                icon_url: entry.attributes.thumb_url,
                url: entry.attributes.url,
            }
        } else if (entry.id === rewardId) {
            reward = entry
        }
    }

    addRewardField(embed, reward, type)
    return embed
}

function addRewardField(embed: Embed, reward: any, type: PatreonAction): void {
    if (reward == null || type === PatreonAction.DELETE) return
    embed.fields = [
        {
            name: 'Unlocked Tier',
            value: `[${reward.attributes.title} ($${(reward.attributes.amount_cents / 100).toFixed(2)}+/mo)](https://www.patreon.com${reward.attributes.url})\n${formatHtml(reward.attributes.description, embed.url!)}`,
            inline: false,
        },
    ]
}

function formatHtml(html: string, baseLink: string): string {
    while (ulRegex.test(html)) {
        const match = ulRegex.exec(html)!
        html = html.replace(ulRegex, match[1])
        let list = match[1]
        while (liRegex.test(list)) {
            const item = liRegex.exec(match[1])!
            list = list.replace(item[0], '')
            html = html.replace(liRegex, '\uFEFF\u00A0\u00A0\u00A0\u00A0\u2022 ' + item[1] + '\n')
        }
    }
    while (boldRegex.test(html)) {
        const match = boldRegex.exec(html)!
        html = html.replace(boldRegex, '**' + match[1] + '**')
    }
    while (italicRegex.test(html)) {
        const match = italicRegex.exec(html)!
        html = html.replace(italicRegex, '_' + match[1] + '_')
    }
    while (underlineRegex.test(html)) {
        const match = underlineRegex.exec(html)!
        html = html.replace(underlineRegex, '__' + match[1] + '__')
    }
    while (anchorRegex.test(html)) {
        const match = anchorRegex.exec(html)!
        const url = match[1].startsWith('#') ? baseLink + match[1] : match[1]
        html = html.replace(anchorRegex, `[${match[2]}](${url})`)
    }
    while (imageRegex.test(html)) {
        const match = imageRegex.exec(html)!
        html = html.replace(imageRegex, `[View Image..](${match[1]})`)
    }
    return html.replace(/<br>/g, '\n')
}
