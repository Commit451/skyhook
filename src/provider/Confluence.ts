import { Embed } from '../model/DiscordApi'
import { DirectParseProvider } from '../provider/BaseProvider'

/**
 * https://developer.atlassian.com/server/jira/platform/webhooks/
 */
export class Confluence extends DirectParseProvider {
    constructor() {
        super()
        this.setEmbedColor(0x1e45a8)
    }

    public getName(): string {
        return 'Confluence'
    }

    public getPath(): string {
        return 'confluence'
    }

    public async parseData(): Promise<void> {
        if (this.body.eventType == null) {
            this.nullifyPayload()
            return
        }
        // extract variables from Confluence that don't depend on the event
        const user = this.body.userDisplayName || { displayName: 'Anonymous' }
        const event = this.body.eventType

        let embed: Embed

        if (event.startsWith('attachment_')) {
            embed = this.attachmentEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('blog_')) {
            embed = this.blogEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('comment_')) {
            embed = this.commentEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('group_')) {
            embed = this.groupEvent(event)
            this.addEmbed(embed)
        } else if (event.startsWith('label_')) {
            embed = this.labelEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('page_')) {
            embed = this.pageEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('space_')) {
            embed = this.spaceEvent(event, user)
            this.addEmbed(embed)
        } else if (event.startsWith('user_')) {
            embed = this.userEvent(event)
            this.addEmbed(embed)
        } else {
            // This is to nullify the payload for currently unsupported events
            this.nullifyPayload()
            return
        }

    }

    private attachmentEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            attachment_created	a file is attached to a page or blog post
            attachment_removed	a file is deleted (sent to the trash) from the attachments page(not triggered when a version is deleted from the file history)
            attachment_restored	a file is restored from the trash
            attachment_trashed	a file is purged from the trash
            attachment_updated	a new file version of is uploaded directly or by editing the file

         */

        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const content_title = this.body.attachedTo.title
        const space = this.body.attachedTo.spaceName
        const content_type = this.body.attachedTo.contentType
        const url = this.body.attachedTo.self
        let description

        if (event.startsWith('attachment_removed')) {
            description = user + ' ' + action + ' from ' + content_type + ' ' + content_title + ' in ' + space
        } else if (event.startsWith('attachment_created') || event.startsWith('attachment_updated')) {
            description = user + ' ' + action + ' on ' + content_type + ' ' + content_title + ' in ' + space
        } else {
            description = user + ' ' + action
        }

        const embed: Embed = {
            title: title,
            url: url,
            description: description
        }

        return embed
    }

    private blogEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            blog_created	a blog post is published
            blog_removed	a blog post is deleted (sent to the trash)
            blog_restored	a blog post is restored from the trash
            blog_trashed	a blog post is purged from the trash
            blog_updated	a blog post is edited
         */
        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const content_title = this.body.blog.title
        const url = this.body.blog.self

        const embed: Embed = {
            title: title,
            url: url,
            description: user + ' ' + action + ' ' + content_title
        }

        return embed
    }

    private commentEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            comment_created	    a page comment, inline comment or file comment is made
            comment_removed	    a page comment, inline comment, or file comment is deleted
            comment_updated	    a page comment, inline comment, or file comment is edited

         */
        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const content_title = this.body.comment.parent.title
        const content_type = this.body.comment.parent.contentType
        const space = this.body.comment.spaceName
        const url = this.body.comment.parent.self

        const embed: Embed = {
            title: title,
            url: url,
            description: user + ' ' + action + ' on ' + content_type + ' ' + content_title + ' in ' + space
        }

        return embed
    }

    private labelEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            label_added	    an existing label is applied to a page, blog post, or space
            label_created   a label is added for the first time (did not already exist)
            label_deleted   a label is removed from the last page, blog post, or space, and so ceases to exist
            label_removed   a label is removed from a page, blog post, or space

         */
        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const label_title = this.body.label.name
        const space = this.body.labeled.spaceName
        const url = this.body.label.self
        let description
        let content_title
        let content_type

        if (event.startsWith('label_created') || event.startsWith('label_deleted')) {
            description = user + ' ' + action + ' ' + label_title
        } else if (event.startsWith('label_removed')) {
            content_title = this.body.labeled.title
            content_type = this.body.labeled.contentType
            description = user + ' ' + action + ' from ' + content_type + ' ' + content_title + ' in ' + space
        } else if (event.startsWith('label_added')) {
            content_title = this.body.labeled.title
            content_type = this.body.labeled.contentType
            description = user + ' ' + action + ' to ' + content_type + ' ' + content_title + ' in ' + space
        }

        const embed: Embed = {
            title: title,
            url: url,
            description: description
        }

        return embed
    }

    private pageEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            page_children_reordered  the default ordering of pages is changed to alphabetical in the Space Tools > Reorder pages tab(is not triggered when you drag a page, or move a page, to change the page order)
            page_created    a page is published for the first time, including pages created from a template or blueprint
            page_moved	    a page is moved to a different position in the page tree, to a different parent page, or to another space
            page_removed	a page is deleted (sent to the trash)
            page_restored	a page is restored from the trash
            page_trashed	a page is purged from the trash
            page_updated	a page is edited (triggered at the point the unpublished changes are published)

         */
        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const content_title = this.body.page.title
        const url = this.body.page.self

        const embed: Embed = {
            title: title,
            url: url,
            description: user + ' ' + action + ' ' + content_title
        }

        return embed
    }

    private spaceEvent(event: string, user: string): Embed {
        /**
         *  Event	            Triggered when...
            space_created	    a new space is created
            space_logo_updated	a new file is uploaded for use as the logo of a space
            space_permissions_updated	space permissions are changed in the Space Tools > Permissions tab(is not triggered when you edit space permissions using Inspect Permissions)
            space_removed	    a space is deleted
            space_updated       the space details (title, description, status) is updated in the Space Tools > Overview tab 

         */

        const title = this.setEventTitle(event)
        const action = this.setActionTitle(event)
        const content_title = this.body.space.title
        const url = this.body.space.self

        const embed: Embed = {
            title: title,
            url: url,
            description: user + ' ' + action + ' ' + content_title
        }

        return embed
    }

    private userEvent(event: string): Embed {
        /**
         *  Event	            Triggered when...
            user_created        a new user account is created
            user_deactivated	a user account is disabled
            user_followed	    someone follows a user
            user_reactivated	a disabled user account is enabled
            user_removed	    a user account is deleted 
         */

        const title = this.setEventTitle(event)
        const content_title = this.body.userProfile.fullName

        const embed: Embed = {
            title: title,
            description: title + ' ' + content_title
        }

        return embed
    }

    private groupEvent(event: string): Embed {
        /**
         *  Event	            Triggered when...
            group_created a new group is created 
            group_removed a group is deleted 
         */

        const title = this.setEventTitle(event)
        const content_title = this.body.groupName

        const embed: Embed = {
            title: title,
            description: title + ' ' + content_title
        }

        return embed
    }

    //Utility Method for Capitalizing Words
    private capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1)
    }
    //Utility Method for Setting Event Title
    private setEventTitle(event: string): string {
        const event_words = event.split('_')
        if (event_words.length == 3) {
            return this.capitalizeFirstLetter(event.split('_')[2]) +
                ' ' + this.capitalizeFirstLetter(event.split('_')[1]) +
                ' ' + this.capitalizeFirstLetter(event.split('_')[0])
        } else {
            return this.capitalizeFirstLetter(event.split('_')[1]) +
                ' ' + this.capitalizeFirstLetter(event.split('_')[0])
        }
    }
    //Utility Method for Setting Event Title
    private setActionTitle(event: string): string {
        const event_words = event.split('_')
        if (event_words.length == 3) {
            return event.split('_')[2] +
                ' ' + (event.split('_')[1]) +
                ' ' + (event.split('_')[0])
        } else {
            return event.split('_')[1] +
                ' ' + event.split('_')[0]
        }
    }
}   
