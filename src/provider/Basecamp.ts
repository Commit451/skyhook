import TurndownService from 'turndown'
import type { Embed } from '../model/DiscordApi.ts'
import { defineProvider } from './Provider.ts'

const COLOR_CREATED = 0x00ff00
const COLOR_DELETED = 0xff0000
const COLOR_ARCHIVED = 0x8b0000
const COLOR_UNARCHIVED = 0x66cdaa
const COLOR_EDITED = 0x40e0d0
const turndown = new TurndownService()

interface EventFormat {
    readonly color: number
    readonly action: string
    readonly content?: boolean
    readonly fields?: readonly ('title' | 'type')[]
}

const EVENT_FORMATS: Readonly<Record<string, EventFormat>> = {
    comment_trashed: { color: COLOR_DELETED, action: 'deleted comment', content: true, fields: ['title'] },
    comment_created: { color: COLOR_CREATED, action: 'added comment', content: true, fields: ['title'] },
    comment_content_changed: { color: COLOR_EDITED, action: 'changed comment', content: true, fields: ['title'] },
    comment_archived: { color: COLOR_ARCHIVED, action: 'archived comment', content: true, fields: ['title'] },
    comment_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived comment', content: true, fields: ['title'] },
    todo_created: { color: COLOR_CREATED, action: 'created todo', fields: ['title'] },
    todo_completed: { color: 0x4ca3dd, action: 'completed todo', fields: ['title'] },
    todo_archived: { color: COLOR_ARCHIVED, action: 'archived todo', fields: ['title'] },
    todo_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived todo', fields: ['title'] },
    todo_trashed: { color: COLOR_DELETED, action: 'deleted todo', fields: ['title'] },
    todolist_description_changed: {
        color: COLOR_EDITED,
        action: "changed todolist's description",
        content: true,
        fields: ['title'],
    },
    todolist_created: { color: COLOR_CREATED, action: 'created todolist', content: true, fields: ['title'] },
    todolist_archived: { color: COLOR_ARCHIVED, action: 'archived todolist', fields: ['title'] },
    todolist_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived todolist', fields: ['title'] },
    todolist_trashed: { color: COLOR_DELETED, action: 'deleted todolist', fields: ['title'] },
    message_created: { color: COLOR_CREATED, action: 'published message', content: true, fields: ['title'] },
    message_active: { color: COLOR_CREATED, action: 'published message', content: true, fields: ['title'] },
    message_archived: { color: COLOR_ARCHIVED, action: 'archived message', content: true, fields: ['title'] },
    message_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived message', content: true, fields: ['title'] },
    message_trashed: { color: COLOR_DELETED, action: 'deleted message', content: true, fields: ['title'] },
    vault_created: { color: COLOR_CREATED, action: "created doc's folder", fields: ['title'] },
    vault_copied: { color: COLOR_CREATED, action: "copied doc's folder", fields: ['title'] },
    vault_inserted: { color: COLOR_CREATED, action: "added doc's folder", fields: ['title'] },
    vault_title_changed: { color: COLOR_EDITED, action: "changed folder's title", fields: ['title'] },
    vault_trashed: { color: COLOR_DELETED, action: 'deleted folder', content: true, fields: ['title'] },
    vault_archived: { color: COLOR_ARCHIVED, action: 'archived folder', content: true, fields: ['title'] },
    vault_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived folder', content: true, fields: ['title'] },
    upload_created: { color: COLOR_CREATED, action: 'uploaded file', content: true, fields: ['title'] },
    upload_active: { color: COLOR_CREATED, action: 'uploaded file', content: true, fields: ['title'] },
    upload_copied: { color: COLOR_CREATED, action: 'copied file', content: true, fields: ['title'] },
    upload_inserted: { color: COLOR_CREATED, action: 'added file', content: true, fields: ['title'] },
    upload_archived: { color: COLOR_ARCHIVED, action: 'archived file', content: true, fields: ['title'] },
    upload_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived file', content: true, fields: ['title'] },
    upload_trashed: { color: COLOR_DELETED, action: 'deleted file', content: true, fields: ['title'] },
    document_created: { color: COLOR_CREATED, action: 'created document', content: true, fields: ['title'] },
    document_active: { color: COLOR_CREATED, action: 'created document', content: true, fields: ['title'] },
    document_copied: { color: COLOR_CREATED, action: 'copied document', content: true, fields: ['title'] },
    document_inserted: { color: COLOR_CREATED, action: 'added document', content: true, fields: ['title'] },
    document_archived: { color: COLOR_ARCHIVED, action: 'archived document', content: true, fields: ['title'] },
    document_unarchived: { color: COLOR_UNARCHIVED, action: 'unarchived document', content: true, fields: ['title'] },
    document_trashed: { color: COLOR_DELETED, action: 'deleted document', content: true, fields: ['title'] },
    google_document_created: {
        color: COLOR_CREATED,
        action: 'created Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_active: {
        color: COLOR_CREATED,
        action: 'created Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_copied: {
        color: COLOR_CREATED,
        action: 'copied Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_inserted: {
        color: COLOR_CREATED,
        action: 'added Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_archived: {
        color: COLOR_ARCHIVED,
        action: 'archived Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_unarchived: {
        color: COLOR_UNARCHIVED,
        action: 'unarchived Google Document',
        content: true,
        fields: ['title'],
    },
    google_document_trashed: {
        color: COLOR_DELETED,
        action: 'deleted Google Document',
        content: true,
        fields: ['title'],
    },
}

/**
 * https://github.com/basecamp/bc3-api/blob/master/sections/webhooks.md
 */
export const Basecamp = defineProvider({
    path: 'basecamp',
    name: 'Basecamp',
    example: { body: 'basecamp/basecamp.json' },
    map({ body }, output) {
        const format = EVENT_FORMATS[body.kind] ?? {
            color: 0xf0ff00,
            action: body.kind,
            content: true,
            fields: ['title', 'type'] as const,
        }
        output.addEmbed(createEmbed(body, format))
    },
})

function createEmbed(body: Record<string, any>, format: EventFormat): Embed {
    const embed: Embed = {
        title: `${format.action} on ${body.recording.bucket.name} / ${body.recording.parent.type} : ${body.recording.parent.title}`,
        url: body.recording.app_url,
        color: format.color,
        author: {
            name: body.recording.creator.name,
            icon_url: body.recording.creator.avatar_url,
        },
        fields: [],
    }

    if (format.content) {
        embed.description = turndown.turndown(body.recording.content || '').substring(0, 4096)
    }
    for (const field of format.fields ?? []) {
        if (field === 'title') {
            embed.fields!.push({ name: 'Title', value: body.recording.title, inline: true })
        } else if (field === 'type') {
            embed.fields!.push({ name: 'Type', value: body.recording.type, inline: true })
        }
    }
    return embed
}
