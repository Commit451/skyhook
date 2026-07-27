import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

/**
 * https://developer.atlassian.com/server/confluence/webhooks/
 */
export const Confluence = defineProvider({
    path: 'confluence',
    name: 'Confluence',
    example: { body: 'confluence/confluence_page.json' },
    defaults: { embedColor: 0x1e45a8 },
    map({ body }, output) {
        const event = typeof body.eventType === 'string' ? body.eventType : null
        if (event == null) {
            output.ignore()
            return
        }

        const user = typeof body.userDisplayName === 'string' ? body.userDisplayName : 'Anonymous'
        const embed = formatEvent(event, body, user)
        if (embed == null) {
            output.ignore()
            return
        }
        output.addEmbed(embed)
    },
})

function formatEvent(event: string, body: Record<string, any>, user: string): Embed | null {
    if (event.startsWith('attachment_')) return attachmentEvent(event, body, user)
    if (event.startsWith('blog_')) return blogEvent(event, body, user)
    if (event.startsWith('comment_')) return commentEvent(event, body, user)
    if (event.startsWith('group_')) return groupEvent(event, body)
    if (event.startsWith('label_')) return labelEvent(event, body, user)
    if (event.startsWith('page_')) return pageEvent(event, body, user)
    if (event.startsWith('space_')) return spaceEvent(event, body, user)
    if (event.startsWith('user_')) return userEvent(event, body)
    return null
}

function attachmentEvent(event: string, body: Record<string, any>, user: string): Embed {
    const action = actionTitle(event)
    const contentTitle = body.attachedTo.title
    const space = body.attachedTo.spaceName
    const contentType = body.attachedTo.contentType
    let description: string

    if (event.startsWith('attachment_removed')) {
        description = `${user} ${action} from ${contentType} ${contentTitle} in ${space}`
    } else if (event.startsWith('attachment_created') || event.startsWith('attachment_updated')) {
        description = `${user} ${action} on ${contentType} ${contentTitle} in ${space}`
    } else {
        description = `${user} ${action}`
    }

    return {
        title: eventTitle(event),
        url: body.attachedTo.self,
        description,
    }
}

function blogEvent(event: string, body: Record<string, any>, user: string): Embed {
    return {
        title: eventTitle(event),
        url: body.blog.self,
        description: `${user} ${actionTitle(event)} ${body.blog.title}`,
    }
}

function commentEvent(event: string, body: Record<string, any>, user: string): Embed {
    const parent = body.comment.parent
    return {
        title: eventTitle(event),
        url: parent.self,
        description: `${user} ${actionTitle(event)} on ${parent.contentType} ${parent.title} in ${body.comment.spaceName}`,
    }
}

function labelEvent(event: string, body: Record<string, any>, user: string): Embed {
    const action = actionTitle(event)
    const label = body.label.name
    const labeled = body.labeled
    let description: string | undefined

    if (event.startsWith('label_created') || event.startsWith('label_deleted')) {
        description = `${user} ${action} ${label}`
    } else if (event.startsWith('label_removed')) {
        description = `${user} ${action} from ${labeled.contentType} ${labeled.title} in ${labeled.spaceName}`
    } else if (event.startsWith('label_added')) {
        description = `${user} ${action} to ${labeled.contentType} ${labeled.title} in ${labeled.spaceName}`
    }

    return {
        title: eventTitle(event),
        url: body.label.self,
        description,
    }
}

function pageEvent(event: string, body: Record<string, any>, user: string): Embed {
    return {
        title: eventTitle(event),
        url: body.page.self,
        description: `${user} ${actionTitle(event)} ${body.page.title}`,
    }
}

function spaceEvent(event: string, body: Record<string, any>, user: string): Embed {
    return {
        title: eventTitle(event),
        url: body.space.self,
        description: `${user} ${actionTitle(event)} ${body.space.title}`,
    }
}

function userEvent(event: string, body: Record<string, any>): Embed {
    const title = eventTitle(event)
    return {
        title,
        description: `${title} ${body.userProfile.fullName}`,
    }
}

function groupEvent(event: string, body: Record<string, any>): Embed {
    const title = eventTitle(event)
    return {
        title,
        description: `${title} ${body.groupName}`,
    }
}

function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function eventTitle(event: string): string {
    return event.split('_').reverse().map(capitalizeFirstLetter).join(' ')
}

function actionTitle(event: string): string {
    return event.split('_').reverse().join(' ')
}
