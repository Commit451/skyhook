// trello.js
// https://developers.trello.com/apis/webhooks
// ========
module.exports = {
    parse: function (req, discordPayload) {
        //In order to actually see the json payload.
        console.log(req.body);
        console.log(req.body.action.data);

        const body = req.body;
        const type = body.action.type;
        const baselink = 'https://trello.com/';
        const avatarurl = 'https://trello-avatars.s3.amazonaws.com/';

        discordPayload.setEmbedColor(158375);

        let board = null;
        let user = null;

        switch (type) {
            case 'addAdminToBoard':
                user = {
                    name: body.action.memberCreator.fullName,
                    icon_url: avatarurl + body.action.memberCreator.avatarHash + '/170.png',
                    url: baselink + body.action.memberCreator.username
                };
                discordPayload.addEmbed({
                    title: 'Added ' +  body.action.member.fullName + ' (' + body.action.member.username + ') as admin to board ' + body.model.name,
                    url: body.model.url,
                    author: user,
                    thumbnail: avatarurl + body.action.member.avatarHash + '/170.png'
                });
                break;
            case 'addAdminToOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addAttachmentToCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addBoardsPinnedToMember':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addChecklistToCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addLabelToCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addMemberToBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addMemberToCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addMemberToOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'addToOrganizationBoard':
                user = {
                    name: body.action.memberCreator.fullName,
                    icon_url: avatarurl + body.action.memberCreator.avatarHash + '/170.png',
                    url: baselink + body.action.memberCreator.username
                };
                discordPayload.addEmbed({
                    title: 'Board \'' + body.action.data.board.name + '\' created in ' + body.action.data.organization.name,
                    url: baselink + 'b/' + body.action.data.board.shortLink,
                    author: user
                });
                break;
            case 'commentCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'convertToCardFromCheckItem':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'copyBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'copyCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'copyChecklist':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createLabel':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'copyCommentCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createBoardInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createBoardPreference':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createChecklist':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createList':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'createOrganizationInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteAttachmentFromCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteBoardInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteCheckItem':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteLabel':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'deleteOrganizationInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'disablePlugin':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'disablePowerUp':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'emailCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'enablePlugin':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'enablePowerUp':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'makeAdminOfBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'makeAdminOfOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'makeNormalMemberOfBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'makeNormalMemberOfOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'makeObserverOfBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'memberJoinedTrello':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'moveCardFromBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'moveCardToBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'moveListFromBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'moveListToBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeAdminFromBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeAdminFromOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeBoardsPinnedFromMember':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeChecklistFromCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeFromOrganizationBoard':
                user = {
                    name: body.action.memberCreator.fullName,
                    icon_url: avatarurl + body.action.memberCreator.avatarHash + '/170.png',
                    url: baselink + body.action.memberCreator.username
                };
                discordPayload.addEmbed({
                    title: 'Board \'' + body.action.data.board.name + '\' deleted from ' + body.action.data.organization.name,
                    url: body.model.url,
                    author: user
                });
                break;
            case 'removeLabelFromCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeMemberFromBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeMemberFromCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'removeMemberFromOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'unconfirmedBoardInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'unconfirmedOrganizationInvitation':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateBoard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateCheckItem':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateCheckItemStateOnCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateChecklist':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateLabel':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateList':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateMember':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'updateOrganization':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
            case 'voteOnCard':
                user = {

                };
                discordPayload.addEmbed({
                    title: '',
                    url: '',
                    author: user
                });
                break;
        }
    }
};