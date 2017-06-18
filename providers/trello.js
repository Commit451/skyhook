// trello.js
// https://developers.trello.com/apis/webhooks
// ========
const request = require('request');
const baselink = 'https://trello.com/';
const avatarurl = 'https://trello-avatars.s3.amazonaws.com/';
const defTrelloColors = {
    blue: 0x0079bf,
    yellow: 0xd9b51c,
    orange: 0xd29034,
    green: 0x519839,
    red: 0xb04632,
    purple: 0x89609e,
    pink: 0xcd5a91,
    lime: 0x4bbf6b,
    sky: 0x00aecc,
    grey: 0x838c91
};

//Utility
function _addMemberThumbnail(avatarHash, embed){
    if(avatarHash != null && avatarHash !== 'null'){
        embed.thumbnail = {
            url: avatarurl + avatarHash + '/170.png'
        };
    }
}

function _resolveCardURL(card){
    return baselink + 'c/' + card.shortLink + '/' + card.idShort + '-' + card.name.replace(/\s/g, '-').toLowerCase();
}

function _resolveBoardURL(board){
    return baselink + 'b/' + board.shortLink + '/' + board.name.replace(/\s/g, '-').toLowerCase();
}

function _resolveCommentURL(card, commentID){
    return _resolveCardURL(card) + '#comment-' + commentID;
}

function _formatLargeString(str){
    return (str.length > 256 ? str.substring(0, 255) + "\u2026" : str);
}

function _formatAttachment(attachment, embed){
    if(attachment.previewUrl != null){
        embed.image = {url: attachment.previewUrl};
    }
    if(attachment.url != null){
        if(attachment.name !== attachment.url){
            embed.fields = [{
                name: attachment.name,
                value: attachment.url
            }];
        } else {
            embed.description = attachment.url; 
        }
    } else {
        embed.description = attachment.name;
    }
}

function _formatLabel(text, value, embed, discordPayload){
    if(value){
        discordPayload.setEmbedColor(defTrelloColors[value]);
    } else {
        discordPayload.setEmbedColor(0xb6bbbf); // 'No Color'
    }
    if(text){
        embed.description = '`' + text + '`';
    }
}

function _formatPlugin(plugin, embed){
    return new Promise(function(resolve, reject){
        request(plugin.url, {timeout: 200}, function(error, response, body){
            if(error){
                embed.description = plugin.name;
                resolve();
            } else {
                const manifest = JSON.parse(body)
                embed.thumbnail = {
                    url: plugin.url.substring(0, plugin.url.lastIndexOf('/')) + manifest.icon.url.substring(1)
                };
                embed.fields = [{
                    name: manifest.name,
                    value: _formatLargeString(manifest.details),
                    inline: false
                }];
                resolve();
            }
        });
    });
}

function _formatOrganizationUpdate(organization, old, model, embed){
    let field = null;
    if(old != null){
        if(old.prefs != null){
            //Check Prefs
            if(old.prefs.permissionLevel != null){
                field = {
                    name: 'Changed Permission Level of ' + organization.name,
                    value: '`' + old.prefs.permissionLevel + '` \uD83E\uDC6A `' + organization.prefs.permissionLevel + '`',
                    inline: false
                }
            };
        } else if(old.displayName != null){
            field = {
                name: 'Changed Name of ' + organization.name,
                value: '`' + old.displayName + '` \uD83E\uDC6A `' + organization.displayName + '`',
                inline: false
            };
        } else if(old.name != null){
            field = {
                name: 'Changed Short Name of ' + organization.name,
                value: '`' + old.name + '` \uD83E\uDC6A `' + model.name + '`',
            };
        } else if(old.website != null){
            //If new value is empty, organization.website is null
            if(organization.website == null){
                field = {
                    name: 'Removed Website from ' + organization.name,
                    value: 'Old value - ' + old.website,
                    inline: false
                };
            } else {
                field = {
                    name: 'Changed Website of ' + organization.name,
                    value: old.website + ' \uD83E\uDC6A ' + organization.website,
                    inline: false
                };
            }
        } else if(old.desc != null){
            field = {
               name: 'Changed Description of ' + organization.name,
               value: _formatLargeString(old.desc) + '\n`\uD83E\uDC6B`\n' + _formatLargeString(organization.desc),
            };
        }
    } else {
        //Must have been a website update.
        field = {
            name: 'Added Website to ' + organization.name,
            value: organization.website,
            inline: false
        };
    }
    embed.fields = [field];
}

module.exports = {
    parse: function (req, discordPayload) {
        //In order to actually see the json payload. Debug use only.
        console.info(req.body);
        console.info(req.body.action.data);

        const body = req.body;
        const model = body.model;
        const action = body.action;

        //Our responses are based off of these values so it's important that they are present.
        if(model == null || action == null){
            console.error('Trello payload format has changed, provider needs to be updated!');
            return;
        }

        const type = action.type;

        //Use the background color of the board if applicable. Otherwise, use the default trello color.
        if(body.model.prefs != null && body.model.prefs.background != null && defTrelloColors[body.model.prefs.background] != null){
            discordPayload.setEmbedColor(defTrelloColors[body.model.prefs.background]);
        } else {
            discordPayload.setEmbedColor(0x26aa7);
        }

        //Embed Shell, reducing redundant code.
        let ready = false;
        let embed = {
            title: '[' + (model.displayName != null ? model.displayName : model.name) + '] ',
            url: body.model.url,
            author: {
                name: action.memberCreator.fullName,
                icon_url: avatarurl + action.memberCreator.avatarHash + '/170.png',
                url: baselink + action.memberCreator.username
            }
        };

        switch (type) {
            case 'addAdminToBoard': //Deprecated
            case 'addAdminToOrganization': //Deprecated
                embed.title = embed.title + 'Admin Added';
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                _addMemberThumbnail(action.member.avatarHash, embed);
                ready = true;
                break;
            case 'addAttachmentToCard':
                embed.title = embed.title + 'Attachment Added to ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                _formatAttachment(action.data.attachment, embed);
                ready = true;
                break;
            case 'addBoardsPinnedToMember': //How to Trigger?
                break;
            case 'addChecklistToCard':
                embed.title = embed.title + 'Checklist Added to ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                embed.description = '`' + action.data.checklist.name + '`';
                ready = true;
                break;
            case 'addLabelToCard':
                embed.title = embed.title + 'Label Added to ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                _formatLabel(action.data.text, action.data.value, embed, discordPayload);
                ready = true;
                break;
            case 'addMemberToCard':
                if(action.memberCreator.id === action.member.id){
                    embed.title = embed.title + 'User Joined ' + action.data.card.name;
                } else {
                    embed.title = embed.title + 'User Added to ' + action.data.card.name;
                    _addMemberThumbnail(action.member.avatarHash, embed);
                }
                embed.url = _resolveCardURL(action.data.card);
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                ready = true;
                break;
            case 'addMemberToBoard':
            case 'addMemberToOrganization':
                if(action.memberCreator.id === action.member.id){
                    embed.title = embed.title + 'User Joined';
                } else {
                    embed.title = embed.title + 'User Added';
                    _addMemberThumbnail(action.member.avatarHash, embed);
                }
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                ready = true;
                break;
            case 'addToOrganizationBoard':
                embed.title = embed.title + 'Board Added';
                embed.description = '[`' + action.data.board.name + '`](' + _resolveBoardURL(action.data.board) + ')';
                ready = true;
                break;
            case 'commentCard':
                embed.title = embed.title + 'Comment on Card ' + action.data.card.name;
                embed.url = _resolveCommentURL(action.data.card, action.id);
                embed.description = _formatLargeString(action.data.text);
                ready = true;
                break;
            case 'convertToCardFromCheckItem':
                embed.title = embed.title + 'Check Item Converted to Card';
                embed.url = _resolveCardURL(action.data.card);
                embed.description = '`' + action.data.card.name + '` from [' + action.data.cardSource.name + '](' + _resolveCardURL(action.data.cardSource) + ') was converted to a card.';
                ready = true;
                break;
            case 'copyBoard': //Won't Trigger?
                break;
            case 'copyCard':
                embed.title = embed.title + 'Card Copied';
                embed.description = '[`' + action.data.cardSource.name + '`](' + _resolveCardURL(action.data.cardSource) + ') \uD83E\uDC6A [`' + action.data.card.name + '`](' + _resolveCardURL(action.data.card) + ')';
                ready = true;
                break;
            case 'copyChecklist':
                embed.title = embed.title + 'Checklist Copied';
                embed.description = '`' + action.data.checklistSource.name + '` \uD83E\uDC6A `' + action.data.checklist.name + '`';
                ready = true;
                break;
            case 'createLabel':
                embed.title = embed.title + 'Label Created';
                _formatLabel(action.data.label.name, action.data.label.color, embed, discordPayload);
                ready = true;
                break;
            case 'copyCommentCard': //How to Trigger?
                break;
            case 'createBoard': //TODO
                break;
            case 'createBoardInvitation': //Won't Trigger?
                break;
            case 'createBoardPreference': //TODO
                break;
            case 'createCard':
                embed.title = embed.title + 'Card Created';
                embed.description = '[`' + action.data.card.name + '`](' + _resolveCardURL(action.data.card) + ') was added to ' + action.data.list.name + '.';
                ready = true;
                break;
            case 'createCheckItem':
                embed.title = embed.title + 'Check Item Created in ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                embed.description = '`' + action.data.checkItem.name + '` was added to `' + action.data.checklist.name + '`.';
                ready = true;
                break;
            case 'createChecklist': //How to Trigger?
                break;
            case 'createList':
                embed.title = embed.title + 'List Created';
                embed.description = '`' + body.action.data.list.name + '`';
                ready = true;
                break;
            case 'createOrganization': //TODO
                break;
            case 'createOrganizationInvitation': //Won't Trigger?
                break;
            case 'deleteAttachmentFromCard':
                embed.title = embed.title + 'Attachment Removed from ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                _formatAttachment(action.data.attachment, embed);
                ready = true;
                break;
            case 'deleteBoardInvitation': //Won't Trigger?
                break;
            case 'deleteCard':
                embed.title = embed.title + 'Card Deleted';
                embed.description = 'A card was deleted from ' + action.data.list.name + '.';
                ready = true;
                break;
            case 'deleteCheckItem':
                embed.title = embed.title + 'Check Item Deleted from ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                embed.description = '`' + action.data.checkItem.name + '` was removed from `' + action.data.checklist.name + '`.';
                ready = true;
                break;
            case 'deleteLabel':
                embed.title = embed.title + 'Label Deleted';
                ready = true;
                break;
            case 'deleteOrganizationInvitation': //Won't Trigger?
                break;
            case 'disablePlugin': //TODO
                break;
            case 'disablePowerUp': //TODO
                break;
            case 'emailCard': //TODO
                break;
            case 'enablePlugin': //TODO
                /**
                 * Plugins return a link to the plugin manifest.
                 * This contains details about the plugin, in order
                 * to use that we need to make an async request to
                 * retrieve the manifest. That won't work with
                 * the current design.
                 */
                break;
            case 'enablePowerUp': //TODO
                break;
            case 'makeAdminOfBoard':
            case 'makeAdminOfOrganization':
                embed.title = embed.title + 'User Set to Admin';
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                _addMemberThumbnail(action.member.avatarHash, embed);
                ready = true;
                break;
            case 'makeNormalMemberOfBoard':
            case 'makeNormalMemberOfOrganization':
                embed.title = embed.title + 'User Set to Normal Member';
                emed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                _addMemberThumbnail(action.member.avatarHash, embed);
                ready = true;
                break;
            case 'makeObserverOfBoard': //TODO
                break;
            case 'memberJoinedTrello': //TODO
                break;
            case 'moveCardFromBoard': //TODO
                break;
            case 'moveCardToBoard': //TODO
                break;
            case 'moveListFromBoard': //TODO
                break;
            case 'moveListToBoard': //TODO
                break;
            case 'removeAdminFromBoard': //Deprecated
            case 'removeAdminFromOrganization': //Deprecated
                embed.title = embed.title + 'Admin Removed';
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                _addMemberThumbnail(action.member.avatarHash, embed);
                ready = true;
                break;
            case 'removeBoardsPinnedFromMember': //How to Trigger?
                break;
            case 'removeChecklistFromCard':
                embed.title = embed.title + 'Checklist Removed from ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                embed.description = '`' + action.data.checklist.name + '`';
                ready = true;
                break;
            case 'removeFromOrganizationBoard':
                embed.title = embed.title + 'Board Removed';
                embed.description = '`' + body.action.data.board.name + '`';
                ready = true;
                break;
            case 'removeLabelFromCard':
                embed.title = embed.title + 'Label Removed From ' + action.data.card.name;
                embed.url = _resolveCardURL(action.data.card);
                _formatLabel(action.data.text, action.data.value, embed, discordPayload);
                ready = true;
                break;
            case 'removeMemberFromCard':
                if(action.memberCreator.id === action.member.id){
                    embed.title = embed.title + 'User Left ' + action.data.card.name;
                } else {
                    embed.title = embed.title + 'User Removed from ' + action.data.card.name;
                    _addMemberThumbnail(action.member.avatarHash, embed);
                }
                embed.url = _resolveCardURL(action.data.card);
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                ready = true;
                break;
            case 'removeMemberFromBoard':
            case 'removeMemberFromOrganization':
                if(action.memberCreator.id === action.member.id){
                    embed.title = embed.title + 'User Left';
                } else {
                    embed.title = embed.title + 'User Removed';
                    _addMemberThumbnail(action.member.avatarHash, embed);
                }
                embed.description = action.member.fullName + ' ([`' + action.member.username + '`](' + baselink + action.member.username + '))';
                ready = true;
                break;
            case 'unconfirmedBoardInvitation': //How to Trigger?
                break;
            case 'unconfirmedOrganizationInvitation': //How to Trigger?
                break;
            case 'updateBoard': //TODO
                break;
            case 'updateCard': //TODO
                break;
            case 'updateCheckItem': //TODO
                break;
            case 'updateCheckItemStateOnCard': //TODO
                break;
            case 'updateChecklist': //TODO
                break;
            case 'updateLabel': //TODO
                break;
            case 'updateList': //TODO
                break;
            case 'updateMember': //TODO
                break;
            case 'updateOrganization':
                embed.title = embed.title + 'Updated Information';
                _formatOrganizationUpdate(action.data.organization, action.data.old, model, embed);
                ready = true;
                break;
            case 'voteOnCard': //TODO
                break;
        }
        if(ready){
            discordPayload.addEmbed(embed);
        }
    }
};