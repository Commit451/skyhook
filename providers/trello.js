// trello.js
// https://developers.trello.com/apis/webhooks
// ========

const baselink = 'https://trello.com/';
const avatarurl = 'https://trello-avatars.s3.amazonaws.com/';
const colors = {
    blue: 31167,      // #0079bf
    orange: 13799476, // #d29034
    green: 5347385,   // #519839
    red: 11552306,    // #b04632
    purple: 9003166,  // #89609e
    pink: 13458065,   // #cd5a91
    lime: 4964203,    // #4bbf6b
    sky: 44748,       // #00aecc
    grey: 8621201     // #838c91
}

//Utility
function _addMemberThumbnail(avatarHash, embed){
    if(avatarHash != null && avatarHash !== 'null'){
        embed.thumbnail = {
            url: avatarurl + avatarHash + '/170.png'
        };
    }
}

function _resolveCardURL(shortLink){
    return baselink + 'c/' + shortLink;
}

function _resolveBoardURL(shortLink){
    return baselink + 'b/' + shortLink;
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
               value: (old.desc.length > 256 ? old.desc.substring(0, 255) + "\u2026" : old.desc) + '\n`\uD83E\uDC6B`\n' + (organization.desc.length > 256 ? organization.desc.substring(0, 255) + "\u2026" : organization.desc),
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
        //In order to actually see the json payload.
        console.log(req.body);
        console.log(req.body.action.data);

        const body = req.body;
        const type = body.action.type;

        if(body.model.prefs.background != null && colors[body.model.prefs.background] != null){
            discordPayload.setEmbedColor(colors[body.model.prefs.background]);
        } else {
            discordPayload.setEmbedColor(158375); //Default Trello Color
        }

        let board = null;
        let user = {
            name: body.action.memberCreator.fullName,
            icon_url: avatarurl + body.action.memberCreator.avatarHash + '/170.png',
            url: baselink + body.action.memberCreator.username
        };

        let embed = null;

        switch (type) {
            case 'addAdminToBoard': //Deprecated
                embed = {
                    title: 'Added Admin to Board',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was added as an admin to ' + body.action.data.board.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'addAdminToOrganization': //Deprecated
                embed = {
                    title: 'Added Admin to Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was added as an admin to ' + body.action.data.organization.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'addAttachmentToCard':
                break;
            case 'addBoardsPinnedToMember':
                break;
            case 'addChecklistToCard':
                break;
            case 'addLabelToCard':
                break;
            case 'addMemberToBoard':
                embed = {
                    url: body.model.url,
                    author: user
                };
                if(body.action.memberCreator.id === body.action.member.id){
                    embed.title = 'Joined Board';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) has joined ' + body.action.data.board.name + '.';
                } else {
                    embed.title = 'Added User to Board';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was added to ' + body.action.data.board.name + '.';
                    _addMemberThumbnail(body.action.member.avatarHash, embed);
                }
                break;
            case 'addMemberToCard':
                break;
            case 'addMemberToOrganization':
                embed = {
                    url: body.model.url,
                    author: user
                };
                if(body.action.memberCreator.id === body.action.member.id){
                    embed.title = 'Joined Organization';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) has joined ' + body.action.data.organization.name + '.';
                } else {
                    embed.title = 'Added User to Organization';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was added to ' + body.action.data.organization.name + '.';
                    _addMemberThumbnail(body.action.member.avatarHash, embed);
                }
                break;
            case 'addToOrganizationBoard':
                embed = {
                    title: 'Added Board to Organization',
                    url: body.model.url,
                    description: '[`' + body.action.data.board.name + '`](' + _resolveBoardURL(body.action.data.board.shortLink) + ') was added to ' +  body.action.data.organization.name + '.',
                    author: user
                };
                break;
            case 'commentCard':
                break;
            case 'convertToCardFromCheckItem':
                break;
            case 'copyBoard':
                break;
            case 'copyCard':
                //TODO make this look nicer
                embed = {
                    title: 'Copied Card \'' + body.action.data.cardSource.name + '\'',
                    url: _resolveCardURL(body.action.data.cardSource.shortLink),
                    description: 'Copied to ' + body.action.data.list.name + ' in ' +  body.action.data.board.name + ' under the name [`' + body.action.data.card.name + '`](' + _resolveCardURL(body.action.data.card.shortLink) + ').',
                    author: user
                };
                break;
            case 'copyChecklist':
                break;
            case 'createLabel':
                break;
            case 'copyCommentCard':
                break;
            case 'createBoard':
                break;
            case 'createBoardInvitation':
                break;
            case 'createBoardPreference':
                break;
            case 'createCard':
                embed = {
                    title: 'Created Card',
                    url: body.model.url,
                    description: '[`' + body.action.data.card.name + '`](' + _resolveCardURL(body.action.data.card.shortLink) + ') was added to ' + body.action.data.list.name + ' in ' +  body.action.data.board.name + '.',
                    author: user
                };
                break;
            case 'createChecklist':
                break;
            case 'createList':
                embed = {
                    title: 'Created List',
                    url: body.model.url,
                    description: '`' + body.action.data.list.name + '` was created in ' +  body.action.data.board.name + '.',
                    author: user
                };
                break;
            case 'createOrganization':
                break;
            case 'createOrganizationInvitation': //Won't Trigger?
                break;
            case 'deleteAttachmentFromCard':
                break;
            case 'deleteBoardInvitation':
                break;
            case 'deleteCard':
                break;
            case 'deleteCheckItem':
                break;
            case 'deleteLabel':
                break;
            case 'deleteOrganizationInvitation': //Won't Trigger?
                break;
            case 'disablePlugin':
                break;
            case 'disablePowerUp':
                break;
            case 'emailCard':
                break;
            case 'enablePlugin':
                break;
            case 'enablePowerUp':
                break;
            case 'makeAdminOfBoard':
                embed = {
                    title: 'Made User an Admin of Board',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made an admin of ' + body.action.data.board.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'makeAdminOfOrganization':
                embed = {
                    title: 'Made user an Admin of Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made an admin of ' + body.action.data.organization.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'makeNormalMemberOfBoard':
                embed = {
                    title: 'Made User a Normal Member of Board',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made a normal member of ' + body.action.data.board.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'makeNormalMemberOfOrganization':
                embed = {
                    title: 'Made User a Normal Member of Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made a normal member of ' + body.action.data.organization.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'makeObserverOfBoard':
                break;
            case 'memberJoinedTrello':
                break;
            case 'moveCardFromBoard':
                break;
            case 'moveCardToBoard':
                break;
            case 'moveListFromBoard':
                break;
            case 'moveListToBoard':
                break;
            case 'removeAdminFromBoard': //Deprecated
                embed = {
                    title: 'Admin Removed from Board',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was removed from ' + body.action.data.board.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'removeAdminFromOrganization': //Deprecated
                embed = {
                    title: 'Admin Removed from Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was removed from ' + body.action.data.organization.name + '.',
                    author: user
                };
                _addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'removeBoardsPinnedFromMember':
                break;
            case 'removeChecklistFromCard':
                break;
            case 'removeFromOrganizationBoard':
                embed = {
                    title: 'Removed Board from Organization',
                    url: body.model.url,
                    description: '`' + body.action.data.board.name + '` was removed from ' +  body.action.data.organization.name + '.',
                    author: user
                };
                break;
            case 'removeLabelFromCard':
                break;
            case 'removeMemberFromBoard':
                embed = {
                    url: body.model.url,
                    author: user
                };
                if(body.action.memberCreator.id === body.action.member.id){
                    embed.title = 'Left Board';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) has left ' + body.action.data.board.name + '.';
                } else {
                    embed.title = 'Removed User from Board';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was removed from ' + body.action.data.board.name + '.';
                    _addMemberThumbnail(body.action.member.avatarHash, embed);
                }
                break;
            case 'removeMemberFromCard':
                break;
            case 'removeMemberFromOrganization':
                embed = {
                    url: body.model.url,
                    author: user
                };
                if(body.action.memberCreator.id === body.action.member.id){
                    embed.title = 'Left Organization';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) has left ' + body.action.data.organization.name + '.';
                } else {
                    embed.title = 'Removed User from Organization';
                    embed.description = body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was removed from ' + body.action.data.organization.name + '.';
                    _addMemberThumbnail(body.action.member.avatarHash, embed);
                }
                break;
            case 'unconfirmedBoardInvitation':
                break;
            case 'unconfirmedOrganizationInvitation': //Won't Trigger?
                break;
            case 'updateBoard':
                break;
            case 'updateCard':
                break;
            case 'updateCheckItem':
                break;
            case 'updateCheckItemStateOnCard':
                break;
            case 'updateChecklist':
                break;
            case 'updateLabel':
                break;
            case 'updateList':
                break;
            case 'updateMember':
                break;
            case 'updateOrganization':
                embed = {
                    title: 'Updated Organization Information',
                    url: body.model.url,
                    author: user
                };
                _formatOrganizationUpdate(body.action.data.organization, body.action.data.old, body.model, embed);
                break;
            case 'voteOnCard':
                break;
        }
        if(embed != null){
            discordPayload.addEmbed(embed);
        }
    }
};