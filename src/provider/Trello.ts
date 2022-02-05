import axios from 'axios'
import { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi'
import { TypeParseProvder } from '../provider/BaseProvider'
import { MarkdownUtil } from '../util/MarkdownUtil'
import { URL } from 'url'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Card = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Board = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Attachment = any

/**
 * https://developers.trello.com/apis/webhooks
 */
export class Trello extends TypeParseProvder {

    private static baseLink = 'https://trello.com/'
    private static baseAvatarUrl = 'https://trello-avatars.s3.amazonaws.com/'
    private static defTrelloColors: Record<string, number> = {
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

    private static _addMemberThumbnail(avatarHash: string, embed: Embed): void {
        if (avatarHash != null && avatarHash !== 'null') {
            embed.thumbnail = {
                url: this.baseAvatarUrl + avatarHash + '/170.png'
            }
        }
    }

    private static _formatLargeString(str: string, limit = 256): string {
        return str.length > limit ? str.substring(0, limit - 1) + '\u2026' : str
    }

    private embed: Embed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private action: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private model: any

    constructor() {
        super()
        this.embed = {}
    }

    public getName(): string {
        return 'Trello'
    }

    public getType(): string | null {
        return this.body.action.type
    }

    public knownTypes(): string[] {
        return [
            'addAttachmentToCard',
            'addBoardsPinnedToMember',
            'addChecklistToCard',
            'addLabelToCard',
            'addMemberToCard',
            'addMemberToBoard',
            'addMemberToOrganization',
            'addToOrganizationBoard',
            'commentCard',
            'convertToCardFromCheckItem',
            'copyBoard',
            'copyCard',
            'copyChecklist',
            'createLabel',
            'copyCommentCard',
            'createBoard',
            'createBoardInvitation',
            'createBoardPreference',
            'createCard',
            'createCheckItem',
            'createChecklist',
            'createList',
            'createOrganization',
            'createOrganizationInvitation',
            'deleteAttachmentFromCard',
            'deleteBoardInvitation',
            'deleteCard',
            'deleteCheckItem',
            'deleteLabel',
            'deleteOrganizationInvitation',
            'disablePlugin',
            'disablePowerUp',
            'emailCard',
            'enablePlugin',
            'enablePowerUp',
            'makeAdminOfBoard',
            'makeAdminOfOrganization',
            'makeNormalMemberOfBoard',
            'makeNormalMemberOfOrganization',
            'makeObserverOfBoard',
            'memberJoinedTrello',
            'moveCardFromBoard',
            'moveCardToBoard',
            'moveListFromBoard',
            'moveListToBoard',
            'removeBoardsPinnedFromMember',
            'removeChecklistFromCard',
            'removeFromOrganizationBoard',
            'removeLabelFromCard',
            'removeMemberFromCard',
            'removeMemberFromBoard',
            'removeMemberFromOrganization',
            'unconfirmedBoardInvitation',
            'unconfirmedOrganizationInvitation',
            'updateBoard',
            'updateCard',
            'updateCheckItem',
            'updateCheckItemStateOnCard',
            'updateChecklist',
            'updateLabel',
            'updateList',
            'updateMember',
            'updateOrganization',
            'voteOnCard'
        ]
    }

    // Webhook Type Responses

    public async addAttachmentToCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Attachment to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatAttachment(this.action.data.attachment, embed)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async addBoardsPinnedToMember(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async addChecklistToCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Checklist to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checklist.name + '` has been created.'
        this.addEmbed(embed)
    }

    public async addLabelToCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Added Label to "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatLabel(this.action.data.text, this.action.data.value, embed)
        this.addEmbed(embed)
    }

    public async addMemberToCard(): Promise<void> {
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

    public async addMemberToBoard(): Promise<void> {
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

    public async addMemberToOrganization(): Promise<void> {
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

    public async addToOrganizationBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Created Board in "' + this.action.data.organization.name + '"'
        embed.description = '[`' + this.action.data.board.name + '`](' + this._resolveFullBoardURL(this.action.data.board) + ') has been created.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async commentCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Commented on Card "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCommentURL(this.action.data.card, this.action.id)
        embed.description = Trello._formatLargeString(this.action.data.text)
        this.addEmbed(embed)
    }

    public async convertToCardFromCheckItem(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Converted Check Item to Card'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.card.name + '` from card [`' + this.action.data.cardSource.name + '`](' + this._resolveFullCardURL(this.action.data.cardSource) + ') has been converted to a card.'
        this.addEmbed(embed)
    }

    public async copyBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Copied Board'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        embed.description = '`' + this.action.data.board.name + '` has been copied from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        this.addEmbed(embed)
    }

    public async copyCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Copied Card'
        embed.description = '[`' + this.action.data.cardSource.name + '`](' + this._resolveFullCardURL(this.action.data.cardSource) + ') \uD83E\uDC6A [`' + this.action.data.card.name + '``](' + this._resolveFullCardURL(this.action.data.card) + ')'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    public async copyChecklist(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Copied Checklist'
        embed.description = '`' + this.action.data.checklistSource.name + '` \uD83E\uDC6A `' + this.action.data.checklist.name + '`'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async createLabel(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Label'
        this._formatLabel(this.action.data.label.name, this.action.data.label.color, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async copyCommentCard(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async createBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Created Board "' + Trello._formatLargeString(this.action.data.board.name) + '"'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async createBoardInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    // How to Trigger?
    public async createBoardPreference(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async createCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Card'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.card.name + '` has been created in list `' + this.action.data.list.name + '`.'
        this.addEmbed(embed)
    }

    public async createCheckItem(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created Check Item in "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checkItem.name + '` was added to checklist `' + this.action.data.checklist.name + '`.'
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async createChecklist(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async createList(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Created List'
        embed.description = '`' + this.action.data.list.name + '` has been created.'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async createOrganization(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Created Organization'
        embed.description = '`' + this.action.data.organization.name + '` has been created.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async createOrganizationInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async deleteAttachmentFromCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Attachment from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatAttachment(this.action.data.attachment, embed)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async deleteBoardInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async deleteCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Card'
        embed.description = 'A card was deleted from list `' + this.action.data.list.name + '`.'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async deleteCheckItem(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Check Item from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checkItem.name + '` was removed from checklist `' + this.action.data.checklist.name + '`.'
        this.addEmbed(embed)
    }

    public async deleteLabel(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Deleted Label'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // Won't Trigger?
    public async deleteOrganizationInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async disablePlugin(): Promise<void> {
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
            embed.image = {
                url: new URL(manifest.icon.url, url).toString()
            }
        } catch (err) {
            console.log('[Trello Provider] Error while retrieving plugin manifest.')
            console.log(err)
            embed.title = '[' + this.action.data.board.name + '] Disabled Plugin "' + this.action.data.plugin.name + '"'
        }
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async disablePowerUp(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    // How to Trigger?
    public async emailCard(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async enablePlugin(): Promise<void> {
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
            embed.image = {
                url: new URL(manifest.icon.url, url).toString()
            }
        } catch (err) {
            console.log('[Trello Provider] Error while retrieving plugin manifest.')
            console.log(err)
            embed.title = '[' + this.action.data.board.name + '] Enabled Plugin "' + this.action.data.plugin.name + '"'
        }
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async enablePowerUp(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async makeAdminOfBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Admin'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async makeAdminOfOrganization(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.organization.name + '] Set User to Admin'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async makeNormalMemberOfBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Member'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async makeNormalMemberOfOrganization(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.organization.name + '] Set User to Member'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    // Unable to test, business class+ feature.
    public async makeObserverOfBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Set User to Observer'
        embed.description = this.action.member.fullName + ' ([`' + this.action.member.username + '`](' + Trello.baseLink + this.action.member.username + '))'
        Trello._addMemberThumbnail(this.action.member.avatarHash, embed)
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async memberJoinedTrello(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async moveCardFromBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved Card to Another Board'
        embed.description = '[`' + this.action.data.card.name + '`](' + this._resolveCardURL(this.action.data.card.id) + ') has been moved from list `' + this.action.data.list.name + '` to [another board](' + this._resolveBoardURL(this.action.data.boardTarget.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveCardToBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved Card to Board'
        embed.description = '[`' + this.action.data.card.name + '`](' + this._resolveFullCardURL(this.action.data.card) + ') has been moved to list `' + this.action.data.list.name + '` from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveListFromBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved List to Another Board'
        embed.description = '`' + this.action.data.list.name + '` has been moved to [another board](' + this._resolveBoardURL(this.action.data.boardTarget.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async moveListToBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Moved List to Board'
        embed.description = '`' + this.action.data.list.name + '` has been moved from [another board](' + this._resolveBoardURL(this.action.data.boardSource.id) + ').'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    // How to Trigger?
    public async removeBoardsPinnedFromMember(): Promise<void> {
        const embed = this._preparePayload()

        this.addEmbed(embed)
    }

    public async removeChecklistFromCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Checklist from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.checklist.name + '` has been removed.'
        this.addEmbed(embed)
    }

    public async removeFromOrganizationBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = 'Removed Board from "' + this.action.data.organization.name + '"'
        embed.description = '`' + this.action.data.board.name + '` has been deleted.'
        embed.url = this._resolveGenericURL(this.action.data.organization.id)
        this.addEmbed(embed)
    }

    public async removeLabelFromCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Removed Label from "' + this.action.data.card.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this._formatLabel(this.action.data.text, this.action.data.value, embed)
        this.addEmbed(embed)
    }

    public async removeMemberFromCard(): Promise<void> {
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

    public async removeMemberFromBoard(): Promise<void> {
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

    public async removeMemberFromOrganization(): Promise<void> {
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
    public async unconfirmedBoardInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    // How to trigger?
    public async unconfirmedOrganizationInvitation(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async updateBoard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] '
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        let field: EmbedField | null = null
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

    public async updateCard(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] '
        embed.url = this._resolveFullCardURL(this.action.data.card)
        let field: EmbedField | null = null
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

    public async updateCheckItem(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Renamed Item in Checklist "' + this.action.data.checklist.name + '"'
        embed.url = this._resolveFullCardURL(this.action.data.card)
        embed.description = '`' + this.action.data.old.name + '` \uD83E\uDC6A `' + this.action.data.checkItem.name + '`'
        this.addEmbed(embed)
    }

    public async updateCheckItemStateOnCard(): Promise<void> {
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

    public async updateChecklist(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Renamed Checklist'
        embed.description = '`' + Trello._formatLargeString(this.action.data.old.name) + '` \uD83E\uDC6A `' + Trello._formatLargeString(this.action.data.checklist.name) + '`'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        this.addEmbed(embed)
    }

    public async updateLabel(): Promise<void> {
        const embed = this._preparePayload()
        embed.title = '[' + this.action.data.board.name + '] Updated Label'
        embed.url = this._resolveFullBoardURL(this.action.data.board)
        let field: EmbedField | null = null
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

    public async updateList(): Promise<void> {
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
    public async updateMember(): Promise<void> {
        this.nullifyPayload()
        console.log('Not implemented')
    }

    public async updateOrganization(): Promise<void> {
        const embed = this._preparePayload()
        let field: EmbedField | null = null
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

    public async voteOnCard(): Promise<void> {
        const embed = this._preparePayload()
        if (this.action.data.voted) {
            embed.title = '[' + this.action.data.board.name + '] Voted on Card "' + this.action.data.card.name + '" \u2705'
        } else {
            embed.title = '[' + this.action.data.board.name + '] Removed Vote on Card "' + this.action.data.card.name + '"'
        }
        embed.url = this._resolveFullCardURL(this.action.data.card)
        this.addEmbed(embed)
    }

    private _resolveFullCardURL(card: Card): string {
        return Trello.baseLink + 'c/' + card.shortLink + '/' + card.idShort + '-' + card.name.replace(/\s/g, '-').toLowerCase()
    }

    private _resolveFullBoardURL(board: Board): string {
        return Trello.baseLink + 'b/' + board.shortLink + '/' + board.name.replace(/\s/g, '-').toLowerCase()
    }

    private _resolveFullCommentURL(card: Card, commentId: string): string {
        return this._resolveFullCardURL(card) + '#comment-' + commentId
    }

    private _resolveCardURL(id: string): string {
        return Trello.baseLink + 'c/' + id
    }

    private _resolveBoardURL(id: string): string {
        return Trello.baseLink + 'b/' + id
    }

    private _resolveCommentURL(cardID: string, commentId: string): string {
        return this._resolveCardURL(cardID) + '#comment-' + commentId
    }

    private _resolveGenericURL(id: string): string {
        return Trello.baseLink + id
    }

    private _formatAttachment(attachment: Attachment, embed: Embed): void {
        if (attachment.previewUrl != null) {
            embed.image = { url: attachment.previewUrl }
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

    private _formatLabel(text: string, value: string, embed: Embed): void {
        if (value && Trello.defTrelloColors[value] != null) {
            embed.color = Trello.defTrelloColors[value]
        } else {
            embed.color = Trello.defTrelloColors.nocolor
        }
        if (text) {
            embed.description = '`' + text + '`'
        }
    }

    private _resolveUser(): EmbedAuthor {
        const memberCreator = this.body.action.memberCreator
        return {
            name: memberCreator.fullName,
            icon_url: Trello.baseAvatarUrl + memberCreator.avatarHash + '/170.png',
            url: Trello.baseLink + memberCreator.username
        }
    }

    private _preparePayload(): Embed {
        this.action = this.body.action
        this.model = this.body.model

        // Testing code.
        // console.info(this.body.action.type);
        // console.info(this.action.data);

        const embed: Embed = {
            author: this._resolveUser()
        }

        // Use the background color of the board if applicable. Otherwise, use the default trello color.
        if (this.model.prefs != null && this.model.prefs.background != null && Trello.defTrelloColors[this.model.prefs.background] != null) {
            embed.color = Trello.defTrelloColors[this.model.prefs.background]
        } else {
            embed.color = Trello.defTrelloColors.trello
        }

        return embed
    }
}
