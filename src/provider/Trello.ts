import axios from 'axios'
import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { EmbedImage } from '../model/EmbedImage'
import { BaseProvider } from '../provider/BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'

const urlMod = require('url')

/**
 * https://developers.trello.com/apis/webhooks
 */
class Trello extends BaseProvider {

    private static baseLink = 'https://trello.com/'
    private static baseAvatarUrl = 'https://trello-avatars.s3.amazonaws.com/'
    private static defTrelloColors = {
        blue: 0x0079bf,
        yellow: 0xd9b51c,
        orange: 0xd29034,
        green: 0x519839,
        red: 0xb04632,
        purple: 0x89609e,
        pink: 0xcd5a91,
        lime: 0x4bbf6b,
        sky: 0x00aecc,
        grey: 0x838c91,
        trello: 0x026aa7,
        nocolor: 0xb6bbbf
    }

    // Utility Functions

    private static _addMemberThumbnail(avatarHash, embed) {
        if (avatarHash != null && avatarHash !== 'null') {
            embed.thumbnail = {
                url: this.baseAvatarUrl + avatarHash + '/170.png'
            }
        }
    }

    private static _formatLargeString(str, limit = 256) {
        return (str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str)
    }

    private embed: Embed
    private action: any
    private model: any

    constructor() {
        super()
        this.embed = new Embed()
    }

    public getName() {
        return 'Trello'
    }

    public getType(): string {
        return this.body.action.type
    }

    // Webhook Type Responses

    public async addAttachmentToCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Attachment to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatAttachment(this.action.data.attachment, embed)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async addBoardsPinnedToMember() {
        console.log('Not implemented')
    }

    public async addChecklistToCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Checklist to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checklist.name + '` has been created.'
        this.addEmbed(embed)
    }

    public async addLabelToCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Label to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatLabel(this.action.data.text, this.action.data.value, embed)
        this.addEmbed(embed)
    }

    public async addMemberToCard() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = '[' + this.action.data.board.name + '] Joined "' + this.action.data.card.name + '"'
        } else {
            embed.title = '[' + this.action.data.board.name + '] Added User to "' + this.action.data.card.name + '"'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        }
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    public async addMemberToBoard() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = 'Joined Board "' + this.action.data.board.name + '"'
        } else {
            embed.title = 'Added User to Board "' + this.action.data.board.name + '"'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        }
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async addMemberToOrganization() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = 'Joined Organization "' + this.action.data.organization.name + '"'
        } else {
            embed.title = 'Added User to Organization "' + this.action.data.organization.name + '"'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        }
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async addToOrganizationBoard() {
        const embed = this._preparePayload()
        embed.title = 'Created Board in "' + this.action.data.organization.name + '"'
        embed.description = '[`' + this.action.data.board.name + '`](' + this._resolveFullBoardURL(this.action.data.board) + ') has been created.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async commentCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Commented on Card "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCommentURL(this.action.data.card, this.action.id)
        embed.description = Trello._formatLargeString(this.action.data.text)
        this.addEmbed(embed)
    }

    public async convertToCardFromCheckItem() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Converted Check Item to Card'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.card.name + '` from card [`' + this.action.data.cardSource.name + '`](' + this._resolveFullCardURL(this.action.data.cardSource) + ') has been converted to a card.'
        this.addEmbed(embed)
    }

    public async copyBoard() {
        const embed = this._preparePayload()
        embed.title = 'Copied Board'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        embed.description = '`' + this.action.data.board.name + '` has been copied from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        this.addEmbed(embed)
    }

    public async copyCard() {
        const embed = this._preparePayload()
        embed.title = 'Copied Card'
        embed.description = '[`' + this.action.data.cardSource.name + '`](' + this._resolveFullCardURL(this.action.data.cardSource) + ') \uD83E\uDC6A [`' + this.action.data.card.name + '``](' + this._resolveFullCardURL(this.action.data.card) + ')'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    public async copyChecklist() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Copied Checklist'
        embed.description = '`' + this.action.data.checklistSource.name + '` \uD83E\uDC6A `' + this.action.data.checklist.name + '`'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async createLabel() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Label'
        this._formatLabel(this.action.data.label.name, this.action.data.label.color, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async copyCommentCard() {
        console.log('Not implemented')
    }

    public async createBoard() {
        const embed = this._preparePayload()
        embed.title = 'Created Board "' + Trello._formatLargeString(this.action.data.board.name) + '"'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async createBoardInvitation() {
        console.log('Not implemented')
    }

    // How to Trigger?
    public async createBoardPreference() {
        console.log('Not implemented')
    }

    public async createCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Card'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.card.name + '` has been created in list `' + this.action.data.list.name + '`.'
        this.addEmbed(embed)
    }

    public async createCheckItem() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Check Item in "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checkItem.name + '` was added to checklist `' + this.action.data.checklist.name + '`.'
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async createChecklist() {
        console.log('Not implemented')
    }

    public async createList() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created List'
        embed.description = '`' + this.action.data.list.name + '` has been created.'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async createOrganization() {
        const embed = this._preparePayload()
        embed.title = 'Created Organization'
        embed.description = '`' + this.action.data.organization.name + '` has been created.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async createOrganizationInvitation() {
        console.log('Not implemented')
    }

    public async deleteAttachmentFromCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Attachment from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatAttachment(this.action.data.attachment, embed)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async deleteBoardInvitation() {
        console.log('Not implemented')
    }

    public async deleteCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Card'
        embed.description = 'A card was deleted from list `' + this.action.data.list.name + '`.'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async deleteCheckItem() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Check Item from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checkItem.name + '` was removed from checklist `' + this.action.data.checklist.name + '`.'
        this.addEmbed(embed)
    }

    public async deleteLabel() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Label'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async deleteOrganizationInvitation() {
        console.log('Not implemented')
    }

    public async disablePlugin() {
        const embed = this._preparePayload()
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        const url = this.action.data.plugin.url
        try {
            const response = await axios.get(url)
            const manifest = response.data
            const desc = MarkdownUtil._formatMarkdown(manifest.details, embed)
            embed.title = '[' + this.action.data.board.name + '] Disabled Plugin \u2717'
            embed.fields = [{
                name: manifest.name,
                value: desc,
                inline: false
            }]
            const thumbnail = new EmbedImage()
            thumbnail.url = urlMod.resolve(url, manifest.icon.url)
            embed.image = thumbnail
        } catch (err) {
            console.log('[Trello Provider] Error while retrieving plugin manifest.')
            console.log(err)
            embed.title = '[' + this.action.data.board.name + '] Disabled Plugin "' + this.action.data.plugin.name + '"'
        }
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async disablePowerUp() {
        console.log('Not implemented')
    }

    // How to Trigger?
    public async emailCard() {
        console.log('Not implemented')
    }

    public async enablePlugin() {
        const embed = this._preparePayload()
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        const url = this.action.data.plugin.url
        try {
            const response = await axios.get(url)
            const manifest = response.data
            const desc = MarkdownUtil._formatMarkdown(manifest.details, embed)
            embed.title = '[' + this.action.data.board.name + '] Enabled Plugin \u2713'
            embed.fields = [{
                name: manifest.name,
                value: desc,
                inline: false
            }]
            const thumbnail = new EmbedImage()
            thumbnail.url = urlMod.resolve(url, manifest.icon.url)
            embed.image = thumbnail
        } catch (err) {
            console.log('[Trello Provider] Error while retrieving plugin manifest.')
            console.log(err)
            embed.title = '[' + this.action.data.board.name + '] Enabled Plugin "' + this.action.data.plugin.name + '"'
        }
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async enablePowerUp() {
        console.log('Not implemented')
    }

    public async makeAdminOfBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Admin'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async makeAdminOfOrganization() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.organization.name + '] Set User to Admin'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async makeNormalMemberOfBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Member'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async makeNormalMemberOfOrganization() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.organization.name + '] Set User to Member'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    // Unable to test, business class+ feature.
    public async makeObserverOfBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Observer'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async memberJoinedTrello() {
        console.log('Not implemented')
    }

    public async moveCardFromBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved Card to Another Board'
        embed.description = '[`' + this.action.data.card.name + '`](' + this._resolveCardURL(this.action.data.card.id) + ') has been moved from list `' + this.action.data.list.name + '` to [another board](' + this._resolveBoardURL(this.action.data.boardTarget.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveCardToBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved Card to Board'
        embed.description = '[`' + this.action.data.card.name + '`](' + this._resolveFullCardURL(this.action.data.card) + ') has been moved to list `' + this.action.data.list.name + '` from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveListFromBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved List to Another Board'
        embed.description = '`' + this.action.data.list.name + '` has been moved to [another board](' + this._resolveBoardURL(this.action.data.boardTarget.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveListToBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved List to Board'
        embed.description = '`' + this.action.data.list.name + '` has been moved from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async removeBoardsPinnedFromMember() {
        const embed = this._preparePayload()

        this.addEmbed(embed)
    }

    public async removeChecklistFromCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Checklist from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checklist.name + '` has been removed.'
        this.addEmbed(embed)
    }

    public async removeFromOrganizationBoard() {
        const embed = this._preparePayload()
        embed.title = 'Removed Board from "' + this.action.data.organization.name + '"'
        embed.description = '`' + this.action.data.board.name + '` has been deleted.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async removeLabelFromCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Label from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatLabel(this.action.data.text, this.action.data.value, embed)
        this.addEmbed(embed)
    }

    public async removeMemberFromCard() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = '[' + this.action.data.board.name + '] Left "' + this.action.data.card.name + '"'
        } else {
            embed.title = '[' + this.action.data.board.name + '] Removed User from "' + this.action.data.card.name + '"'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        }
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    public async removeMemberFromBoard() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = 'Left Board "' + this.action.data.board.name + '"'
        } else {
            embed.title = 'Removed User from Board "' + this.action.data.board.name + '"'
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        }
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async removeMemberFromOrganization() {
        const embed = this._preparePayload()
        if (this.action.memberCreator.id === this.action.member.id) {
            embed.title = 'Left Organization "' + this.action.data.organization.name + '"'
        } else {
            embed.title = 'Removed User from Organization "' + this.action.data.organization.name + '"'
            Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
            embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        }
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async unconfirmedBoardInvitation() {
        console.log('Not implemented')
    }

    // How to trigger?
    public async unconfirmedOrganizationInvitation() {
        console.log('Not implemented')
    }

    public async updateBoard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] '
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        let field = null
        if (this.action.data.old != null) {
            const old = this.action.data.old
            if (old.closed != null) {
                if (this.action.data.card.closed) {
                    embed.title = 'Closed Board "' + this.action.data.board.name + '"'
                } else {
                    embed.title = 'Reopened Board "' + this.action.data.board.name + '"'
                }
            } else if (old.name != null) {
                embed.title = embed.title + 'Renamed Board'
                embed.description = '`' + old.name + '` \uD83E\uDC6A `' + this.action.data.board.name + '`'
            } else if (old.prefs != null) {
                embed.title = embed.title + 'Updated Board Preference'
                if (old.prefs.permissionLevel != null) {
                    field = {
                        name: 'Permission Level',
                        value: '`' + old.prefs.permissionLevel + '` \uD83E\uDC6A `' + this.action.data.board.prefs.permissionLevel + '`',
                        inline: false
                    }
                } else if (old.prefs.selfJoin != null) {
                    field = {
                        name: 'Allow Team Members to Join',
                        value: '`' + old.prefs.selfJoin + '` \uD83E\uDC6A `' + this.action.data.board.prefs.selfJoin + '`',
                        inline: false
                    }
                } else if (old.prefs.invitations != null) {
                    field = {
                        name: 'Add/Remove Permissions',
                        value: '`' + old.prefs.invitations + '` \uD83E\uDC6A `' + this.action.data.board.prefs.invitations + '`',
                        inline: false
                    }
                } else if (old.prefs.comments != null) {
                    field = {
                        name: 'Commenting Permissions',
                        value: '`' + old.prefs.comments + '` \uD83E\uDC6A `' + this.action.data.board.prefs.comments + '`',
                        inline: false
                    }
                } else if (old.prefs.cardCovers != null) {
                    field = {
                        name: 'Enable Card Cover Images',
                        value: '`' + old.prefs.cardCovers + '` \uD83E\uDC6A `' + this.action.data.board.prefs.cardCovers + '`',
                        inline: false
                    }
                } else if (old.prefs.background != null) {
                    const val = Trello.defTrelloColors[this.action.data.board.prefs.background] == null ? 'image' : this.action.data.board.prefs.background
                    const oldVal = Trello.defTrelloColors[old.prefs.background] == null ? 'image' : old.prefs.background
                    field = {
                        name: 'Background',
                        value: '`' + oldVal + '` \uD83E\uDC6A `' + val + '`',
                        inline: false
                    }
                }
            }
        }
        if (field != null) {
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    public async updateCard() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] '
        embed.url = this._resolveFullCardURL(this.action.data.card)
        let field = null
        if (this.action.data.old != null) {
            const old = this.action.data.old
            if (old.name != null) {
                embed.title = embed.title + 'Renamed Card'
                embed.description = '`' + old.name + '` \uD83E\uDC6A `' + this.action.data.card.name + '`'
            } else if (old.desc != null) {
                if (!old.desc) {
                    embed.title = embed.title + 'Added Description to Card "' + this.action.data.card.name + '"'
                    embed.description = Trello._formatLargeString(MarkdownUtil._formatMarkdown(this.action.data.card.desc, embed))
                } else if (!this.action.data.card.desc) {
                    embed.title = embed.title + 'Removed Description from Card "' + this.action.data.card.name + '"'
                    field = {
                        name: 'Old Value',
                        value: Trello._formatLargeString(MarkdownUtil._formatMarkdown(old.desc, embed)),
                        inline: false
                    }
                } else {
                    embed.title = embed.title + 'Updated Description of Card "' + this.action.data.card.name + '"'
                    embed.description = Trello._formatLargeString(MarkdownUtil._formatMarkdown(this.action.data.card.desc, embed))
                }
            } else if (old.due != null || this.action.data.card.due != null) {
                if (old.due == null) {
                    const d = new Date(this.action.data.card.due)
                    embed.title = embed.title + 'Added Due Date to "' + this.action.data.card.name + '" \uD83D\uDDD3'
                    embed.description = '`' + d.toUTCString() + '`'
                } else if (this.action.data.card.due == null) {
                    const d = new Date(old.due)
                    embed.title = embed.title + 'Removed Due Date from "' + this.action.data.card.name + '" \uD83D\uDDD3'
                    field = {
                        name: 'Old Value',
                        value: '`' + d.toUTCString() + '`',
                        inline: false
                    }
                } else {
                    const d = new Date(this.action.data.card.due)
                    const oldD = new Date(old.due)
                    embed.title = embed.title + 'Changed Due Date of "' + this.action.data.card.name + '" \uD83D\uDDD3'
                    embed.description = '`' + oldD.toUTCString() + '` \uD83E\uDC6A `' + d.toUTCString() + '`'
                }
            } else if (old.closed != null) {
                if (this.action.data.card.closed) {
                    embed.title = embed.title + 'Archived Card "' + this.action.data.card.name + '"'
                } else {
                    embed.title = embed.title + 'Unarchived Card "' + this.action.data.card.name + '"'
                }
            } else if (old.idList != null) {
                embed.title = embed.title + 'Moved Card "' + this.action.data.card.name + '" to Another List'
                embed.description = '`' + this.action.data.listBefore.name + '` \uD83E\uDC6A `' + this.action.data.listAfter.name + '`'
            } else if (old.pos != null) {
                embed.title = embed.title + 'Updated Position of Card "' + this.action.data.card.name + '"'
            }
        }
        if (field != null) {
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    public async updateCheckItem() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Renamed Item in Checklist "' + this.action.data.checklist.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.old.name + '` \uD83E\uDC6A `' + this.action.data.checkItem.name + '`'
        this.addEmbed(embed)
    }

    public async updateCheckItemStateOnCard() {
        const embed = this._preparePayload()
        const capitalized = this.action.data.checkItem.state.charAt(0).toUpperCase() + this.action.data.checkItem.state.slice(1)
        embed.title = '[' + this.action.data.board.name + '] Marked Item as ' + capitalized
        if (this.action.data.checkItem.state === 'complete') {
            embed.title = embed.title + ' `\u2714`'
        } else if (this.action.data.checkItem.state === 'incomplete') {
            embed.title = embed.title + ' `\u2718`'
        }
        embed.description = 'Item `' + this.action.data.checkItem.name + '` in `' + this.action.data.checklist.name + '` has been marked as `' + this.action.data.checkItem.state + '`.'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    public async updateChecklist() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Renamed Checklist'
        embed.description = '`' + Trello._formatLargeString(this.action.data.old.name) + '` \uD83E\uDC6A `' + Trello._formatLargeString(this.action.data.checklist.name) + '`'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async updateLabel() {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Updated Label'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        let field = null
        if (this.action.data.old != null) {
            if (this.action.data.old.color != null) {
                if (this.action.data.label.color) {
                    field = {
                        name: 'Changed Color',
                        value: '`' + this.action.data.old.color + '` \uD83E\uDC6A `' + this.action.data.label.color + '`',
                        inline: false
                    }
                } else {
                    field = {
                        name: 'Removed Color',
                        value: 'Old color - `' + this.action.data.old.color + '`',
                        inline: false
                    }
                }
            } else if (this.action.data.old.name != null) {
                if (this.action.data.old.name) {
                    if (this.action.data.label.name) {
                        field = {
                            name: 'Changed Name',
                            value: '`' + this.action.data.old.name + '` \uD83E\uDC6A `' + this.action.data.label.name + '`',
                            inline: false
                        }
                    } else {
                        field = {
                            name: 'Removed Name',
                            value: 'Old name - `' + this.action.data.old.name + '`',
                            inline: false
                        }
                    }
                } else {
                    field = {
                        name: 'Added Name',
                        value: '`' + this.action.data.label.name + '`',
                        inline: false
                    }
                }
            }
        } else {
            field = {
                name: 'Added Color',
                value: '`' + this.action.data.label.color + '`',
                inline: false
            }
        }
        if (field != null) {
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    public async updateList() {
        const embed = this._preparePayload()
        if (this.action.data.old.closed != null) {
            if (this.action.data.list.closed) {
                embed.title = '[' + this.action.data.board.name + '] Archived List "' + this.action.data.list.name + '"'
            } else {
                embed.title = '[' + this.action.data.board.name + '] Unarchived List "' + this.action.data.list.name + '"'
            }
        } else {
            embed.title = '[' + this.action.data.board.name + '] Renamed List'
            embed.description = '`' + this.action.data.old.name + '` \uD83E\uDC6A `' + this.action.data.list.name + '`'
        }
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async updateMember() {
        console.log('Not implemented')
    }

    public async updateOrganization() {
        const embed = this._preparePayload()
        let field = null
        const organization = this.action.data.organization
        const old = this.action.data.old
        embed.title = '[' + organization.name + '] '
        embed.url = this._resolveGenericURL(organization.id)
        if (old != null) {
            if (old.prefs != null) {
                embed.title = embed.title + 'Updated Organization Preference'
                // Check Prefs
                if (old.prefs.permissionLevel != null) {
                    field = {
                        name: 'Permission Level',
                        value: '`' + old.prefs.permissionLevel + '` \uD83E\uDC6A `' + organization.prefs.permissionLevel + '`',
                        inline: false
                    }
                }
            } else if (old.displayName != null) {
                embed.title = embed.title + 'Renamed Organization'
                embed.description = '`' + old.displayName + '` \uD83E\uDC6A `' + organization.displayName + '`'
            } else if (old.name != null) {
                embed.title = embed.title + 'Changed Short Name of Organization'
                embed.description = '`' + old.name + '` \uD83E\uDC6A `' + this.model.name + '`'
            } else if (old.website != null) {
                // If new value is empty, organization.website is null
                if (organization.website == null) {
                    embed.title = embed.title + 'Removed Website from Organization'
                    field = {
                        name: 'Old Value',
                        value: old.website,
                        inline: false
                    }
                } else {
                    embed.title = embed.title + 'Changed Website of Organization'
                    embed.description = old.website + ' \uD83E\uDC6A ' + organization.website
                }
            } else if (old.desc != null) {
                if (!old.desc) {
                    embed.title = embed.title + 'Added Description to Organization'
                    embed.description = Trello._formatLargeString(MarkdownUtil._formatMarkdown(organization.desc, embed))
                } else if (!organization.desc) {
                    embed.title = embed.title + 'Removed Description from Organization'
                    field = {
                        name: 'Old Value',
                        value: Trello._formatLargeString(MarkdownUtil._formatMarkdown(old.desc, embed)),
                        inline: false
                    }
                } else {
                    embed.title = embed.title + 'Changed Description of Organization'
                    embed.description = Trello._formatLargeString(MarkdownUtil._formatMarkdown(old.desc, embed)) + '\n`\uD83E\uDC6B`\n' + Trello._formatLargeString(MarkdownUtil._formatMarkdown(organization.desc, embed))
                }
            }
        } else {
            // Must have been a website update.
            embed.title = embed.title + 'Added Website to Organization'
            embed.description = organization.website
        }
        if (field != null) {
            embed.fields = [field]
        }
        this.addEmbed(embed)
    }

    public async voteOnCard() {
        const embed = this._preparePayload()
        if (this.action.data.voted) {
            embed.title = '[' + this.action.data.board.name + '] Voted on Card "' + this.action.data.card.name + '" \u2705'
        } else {
            embed.title = '[' + this.action.data.board.name + '] Removed Vote on Card "' + this.action.data.card.name + '"'
        }
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    private _resolveFullCardURL(card) {
        return Trello.baseLink + 'c/' + card.shortLink + '/' + card.idShort + '-' + card.name.replace(/\s/g, '-').toLowerCase()
    }

    private _resolveFullBoardURL(board) {
        return Trello.baseLink + 'b/' + board.shortLink + '/' + board.name.replace(/\s/g, '-').toLowerCase()
    }

    private _resolveFullCommentURL(card, commentID) {
        return this._resolveFullCardURL(card) + '#comment-' + commentID
    }

    private _resolveCardURL(id) {
        return Trello.baseLink + 'c/' + id
    }

    private _resolveBoardURL(id) {
        return Trello.baseLink + 'b/' + id
    }

    private _resolveCommentURL(cardID, commentID) {
        return this._resolveCardURL(cardID) + '#comment-' + commentID
    }

    private _resolveGenericURL(id) {
        return Trello.baseLink + id
    }

    private _formatAttachment(attachment, embed) {
        if (attachment.previewUrl != null) {
            embed.image = {url: attachment.previewUrl}
        }
        if (attachment.url != null) {
            if (attachment.name !== attachment.url) {
                embed.fields = [{
                    name: attachment.name,
                    value: attachment.url
                }]
            } else {
                embed.description = attachment.url
            }
        } else {
            embed.description = attachment.name
        }
    }

    private _formatLabel(text, value, embed) {
        if (value && Trello.defTrelloColors[value] != null) {
            embed.color = Trello.defTrelloColors[value]
        } else {
            embed.color = Trello.defTrelloColors.nocolor
        }
        if (text) {
            embed.description = '`' + text + '`'
        }
    }

    private _resolveUser() {
        const memberCreator = this.body.action.memberCreator
        const author = new EmbedAuthor()
        author.name = memberCreator.fullName
        author.iconUrl = Trello.baseAvatarUrl + memberCreator.avatarHash + '/170.png'
        author.url = Trello.baseLink + memberCreator.username
        return author
    }

    private _preparePayload() {
        this.action = this.body.action
        this.model = this.body.model

        // Testing code.
        // console.info(this.body.action.type);
        // console.info(this.action.data);

        const embed = new Embed()

        // Use the background color of the board if applicable. Otherwise, use the default trello color.
        if (this.model.prefs != null && this.model.prefs.background != null && Trello.defTrelloColors[this.model.prefs.background] != null) {
            embed.color = Trello.defTrelloColors[this.model.prefs.background]
        } else {
            embed.color = Trello.defTrelloColors.trello
        }

        embed.author = this._resolveUser()

        return embed
    }
}

export { Trello }
