// trello.js
// https://developers.trello.com/apis/webhooks
// ========

const baselink = 'https://trello.com/';
const avatarurl = 'https://trello-avatars.s3.amazonaws.com/';

//Utility
function addMemberThumbnail(avatarHash, embed){
    if(avatarHash != null && avatarHash !== 'null'){
        embed.thumbnail = {
            url: avatarurl + avatarHash + '/170.png'
        }
    }
}

module.exports = {
    parse: function (req, discordPayload) {
        //In order to actually see the json payload.
        console.log(req.body);
        console.log(req.body.action.data);

        const body = req.body;
        const type = body.action.type;

        discordPayload.setEmbedColor(158375);

        let board = null;
        let user = {
            name: body.action.memberCreator.fullName,
            icon_url: avatarurl + body.action.memberCreator.avatarHash + '/170.png',
            url: baselink + body.action.memberCreator.username
        };

        let embed = null;

        switch (type) {
            case 'addAdminToBoard':
                break;
            case 'addAdminToOrganization':
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
                break;
            case 'addMemberToCard':
                break;
            case 'addMemberToOrganization':
                embed = {
                    title: 'User Added to Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was added to ' + body.action.data.organization.name + '.',
                    author: user
                };
                addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'addToOrganizationBoard':
                embed = {
                    title: 'Created board ' + body.action.data.board.name + ' in ' + body.action.data.organization.name,
                    url: baselink + 'b/' + body.action.data.board.shortLink,
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
                break;
            case 'createChecklist':
                break;
            case 'createList':
                break;
            case 'createOrganization':
                break;
            case 'createOrganizationInvitation':
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
            case 'deleteOrganizationInvitation':
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
                break;
            case 'makeAdminOfOrganization':
                embed = {
                    title: 'User Permission Change to Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made an admin of ' + body.action.data.organization.name + '.',
                    author: user
                };
                addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'makeNormalMemberOfBoard':
                break;
            case 'makeNormalMemberOfOrganization':
                embed = {
                    title: 'User Permission Change to Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was made a normal member of ' + body.action.data.organization.name + '.',
                    author: user
                };
                addMemberThumbnail(body.action.member.avatarHash, embed);
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
            case 'removeAdminFromBoard':
                break;
            case 'removeAdminFromOrganization':
                break;
            case 'removeBoardsPinnedFromMember':
                break;
            case 'removeChecklistFromCard':
                break;
            case 'removeFromOrganizationBoard':
                embed = {
                    title: 'Deleted board ' + body.action.data.board.name + ' from ' + body.action.data.organization.name,
                    url: body.model.url,
                    author: user
                };
                break;
            case 'removeLabelFromCard':
                break;
            case 'removeMemberFromBoard':
                break;
            case 'removeMemberFromCard':
                break;
            case 'removeMemberFromOrganization':
                embed = {
                    title: 'User Removed from Organization',
                    url: body.model.url,
                    description: body.action.member.fullName + ' ([`' + body.action.member.username + '`](' + baselink + body.action.member.username + ')) was removed from ' + body.action.data.organization.name + '.',
                    author: user
                };
                addMemberThumbnail(body.action.member.avatarHash, embed);
                break;
            case 'unconfirmedBoardInvitation':
                break;
            case 'unconfirmedOrganizationInvitation':
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
                break;
            case 'voteOnCard':
                break;
        }
        if(embed != null){
            discordPayload.addEmbed(embed);
        }
    }
};