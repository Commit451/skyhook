import { createHash } from 'node:crypto'
import { defineProvider } from './Provider.ts'

function gravatarUrl(email: string, size = 100): string {
    const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
    return `https://secure.gravatar.com/avatar/${hash}?s=${size}&r=x&d=retro`
}

/**
 * https://devcenter.heroku.com/articles/app-webhooks
 */
export const Heroku = defineProvider({
    path: 'heroku',
    name: 'Heroku',
    example: { body: 'heroku/heroku.json' },
    defaults: { embedColor: 0xc9c3e6 },
    map({ body }, output) {
        const action = actionAsPastTense(body.action)
        const type = typeAsReadable(body.webhook_metadata.event.include)
        const authorName = body.actor.email
        const name = body.data.name ?? body.data.app.name

        output.addEmbed({
            title: `${authorName} ${action} ${type}. App: ${name}`,
            url: body.data.web_url,
            author: {
                name: authorName,
                icon_url: gravatarUrl(body.actor.email),
            },
        })
    },
})

function actionAsPastTense(action: string): string {
    switch (action) {
        case 'create':
            return 'created'
        case 'destroy':
            return 'destroyed'
        case 'update':
            return 'updated'
        default:
            return 'unknown'
    }
}

function typeAsReadable(type: string): string {
    return type.split('api:')[1]
}
