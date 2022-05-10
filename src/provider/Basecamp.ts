import { Embed } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'

import TurndownService from 'turndown'

/**
 * https://github.com/basecamp/bc3-api/blob/master/sections/webhooks.md
 */
export class Basecamp extends DirectParseProvider {

    private turndown: TurndownService
    private colorCreated = 0x00ff00
    private colorDeleted = 0xff0000
    private colorArchived = 0x8b0000
    private colorUnarchived = 0x66cdaa
    private colorEdited = 0x40e0d0

    constructor() {
        super()
        this.turndown = new TurndownService()
    }

    public getName(): string {
        return 'Basecamp'
    }

    public getPath(): string {
        return 'basecamp'
    }

    public async parseData(): Promise<void> {
        switch (this.body.kind) {
            case 'comment_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted comment', ['title'], true)
                break
            case 'comment_created':
                this.prepareEmbed(this.colorCreated, 'added comment', ['title'], true)
                break
            case 'todo_created':
                this.prepareEmbed(this.colorCreated, 'created todo', ['title'])
                break
            case 'todo_completed':
                this.prepareEmbed(0x4ca3dd, 'completed todo', ['title'])
                break
            case 'todo_archived':
                this.prepareEmbed(this.colorArchived, 'archived todo', ['title'])
                break
            case 'todo_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived todo', ['title'])
                break
            case 'todo_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted todo', ['title'])
                break
            case 'comment_content_changed':
                this.prepareEmbed(this.colorEdited, 'changed comment', ['title'], true)
                break
            case 'todolist_description_changed':
                this.prepareEmbed(this.colorEdited, 'changed todolist\'s description', ['title'], true)
                break
            case 'todolist_created':
                this.prepareEmbed(this.colorCreated, 'created todolist', ['title'], true)
                break
            case 'todolist_archived':
                this.prepareEmbed(this.colorArchived, 'archived todolist', ['title'])
                break
            case 'todolist_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived todolist', ['title'])
                break
            case 'todolist_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted todolist', ['title'])
                break
            case 'message_created':
            case 'message_active':
                this.prepareEmbed(this.colorCreated, 'published message', ['title'], true)
                break
            case 'message_archived':
                this.prepareEmbed(this.colorArchived, 'archived message', ['title'], true)
                break
            case 'message_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived message', ['title'], true)
                break
            case 'message_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted message', ['title'], true)
                break
            case 'comment_archived':
                this.prepareEmbed(this.colorArchived, 'archived comment', ['title'], true)
                break
            case 'comment_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived comment', ['title'], true)
                break
            case 'vault_created':
                this.prepareEmbed(this.colorCreated, 'created doc\'s folder', ['title'],)
                break
            case 'vault_copied':
                this.prepareEmbed(this.colorCreated, 'copied doc\'s folder', ['title'],)
                break
            case 'vault_inserted':
                this.prepareEmbed(this.colorCreated, 'added doc\'s folder', ['title'],)
                break
            case 'vault_title_changed':
                this.prepareEmbed(this.colorEdited, 'changed folder\'s title', ['title'],)
                break
            case 'vault_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted folder', ['title'], true)
                break
            case 'vault_archived':
                this.prepareEmbed(this.colorArchived, 'archived folder', ['title'], true)
                break
            case 'vault_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived folder', ['title'], true)
                break
            case 'upload_created':
            case 'upload_active':
                this.prepareEmbed(this.colorCreated, 'uploaded file', ['title'], true)
                break
            case 'upload_copied':
                this.prepareEmbed(this.colorCreated, 'copied file', ['title'], true)
                break
            case 'upload_inserted':
                this.prepareEmbed(this.colorCreated, 'added file', ['title'], true)
                break
            case 'upload_archived':
                this.prepareEmbed(this.colorArchived, 'archived file', ['title'], true)
                break
            case 'upload_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived file', ['title'], true)
                break
            case 'upload_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted file', ['title'], true)
                break
            case 'document_created':
            case 'document_active':
                this.prepareEmbed(this.colorCreated, 'created document', ['title'], true)
                break
            case 'document_copied':
                this.prepareEmbed(this.colorCreated, 'copied document', ['title'], true)
                break
            case 'document_inserted':
                this.prepareEmbed(this.colorCreated, 'added document', ['title'], true)
                break
            case 'document_archived':
                this.prepareEmbed(this.colorArchived, 'archived document', ['title'], true)
                break
            case 'document_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived document', ['title'], true)
                break
            case 'document_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted document', ['title'], true)
                break
            case 'google_document_created':
            case 'google_document_active':
                this.prepareEmbed(this.colorCreated, 'created Google Document', ['title'], true)
                break
            case 'google_document_copied':
                this.prepareEmbed(this.colorCreated, 'copied Google Document', ['title'], true)
                break
            case 'google_document_inserted':
                this.prepareEmbed(this.colorCreated, 'added Google Document', ['title'], true)
                break
            case 'google_document_archived':
                this.prepareEmbed(this.colorArchived, 'archived Google Document', ['title'], true)
                break
            case 'google_document_unarchived':
                this.prepareEmbed(this.colorUnarchived, 'unarchived Google Document', ['title'], true)
                break
            case 'google_document_trashed':
                this.prepareEmbed(this.colorDeleted, 'deleted Google Document', ['title'], true)
                break
            default:
                console.log('unknown event ' + this.body.kind)
                this.prepareEmbed(0xf0ff00, this.body.kind, ['title', 'type'], true)
                break
        }
    }

    private escapeString(str: string): string {
        if (!str) {
            return ''
        }
        return this.turndown.turndown(str)
    }

    private prepareEmbed(color: number, title: string, fields: string[] = [], content = false): Embed {
        const embed: Embed = {
            title: `${title} on ${this.body.recording.bucket.name} / ${this.body.recording.parent.type} : ${this.body.recording.parent.title}`,
            url: this.body.recording.app_url,
            color: color,
            author: {
                name: this.body.recording.creator.name,
                icon_url: this.body.recording.creator.avatar_url
            },
            fields: []
        }

        if (content) {
            embed.description = this.escapeString(this.body.recording.content).substring(0, 4096)
        }

        const body = this.body
        fields.forEach((field) => {
            switch (field) {
                case 'title':
                    embed.fields!.push({ name: 'Title', value: body.recording.title, inline: true })
                    break
                case 'type':
                    embed.fields!.push({ name: 'Type', value: body.recording.type, inline: true })
            }
        })
        this.addEmbed(embed)
        return embed
    }
}
