// patreon.js
// https://www.patreon.com/platform/documentation/webhooks
// ========
const BaseProvider = require('../util/BaseProvider');
const rpn = require('request-promise-native');

// HTML Regular Expressions
const boldRegex = /<strong>(.*?)<\/strong>/;
const italicRegex = /<em>(.*?)<\/em>/;
const underlineRegex = /<u>(.*?)<\/u>/;
const anchorRegex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/;
const ulRegex = /<ul>(.*?)<\/ul>/;
const liRegex = /<li>(.*?)<\/li>/;
const imageRegex = /<img.*src="(.*?)">/;

class Patreon extends BaseProvider {

    constructor() {
        super();
        this.payload.setEmbedColor(0xF96854);
    }

    static getName() {
        return 'Patreon';
    }

    _formatHTML(html, baseLink) {
        const newLineRegex = /<br>/g;
        //Match lists
        while(ulRegex.test(html)){
            let match = ulRegex.exec(html);
            html = html.replace(ulRegex, match[1]);
            let str = match[1];
            while(liRegex.test(str)){
                let match2 = liRegex.exec(match[1]);
                str = str.replace(match2[0], '');
                html = html.replace(liRegex, '\uFEFF\u00A0\u00A0\u00A0\u00A0\u2022 ' + match2[1] + '\n');
            }
        }
        //Match bold
        while(boldRegex.test(html)){
            let match = boldRegex.exec(html);
            html = html.replace(boldRegex, '**' + match[1] + '**');
        }
        //Match Italic
        while(italicRegex.test(html)){
            let match = italicRegex.exec(html);
            html = html.replace(italicRegex, '_' + match[1] + '_');
        }
        //Replace Underlined
        while(underlineRegex.test(html)){
            let match = underlineRegex.exec(html);
            html = html.replace(underlineRegex, '__' + match[1] + '__');
        }
        //Replace Anchors
        while(anchorRegex.test(html)){
            let match = anchorRegex.exec(html);
            let url = match[1].startsWith('#') ? baseLink + match[1] : match[1];
            html = html.replace(anchorRegex, '[' + match[2] + '](' + url + ')');
        }
        //Replace Images
        while(imageRegex.test(html)){
            let match = imageRegex.exec(html);
            html = html.replace(imageRegex, '[View Image..](' + match[1] + ')');
        }
        //Replace all br tags
        html = html.replace(newLineRegex, '\n');
        return html;
    }

    async getType() {
        return this.req.get('X-Patreon-Event');
    }

    _createUpdateCommon(type){
        let embed = {};
        const creator_id = this.body.data.relationships.creator.data.id;
        const patron_id = this.body.data.relationships.patron.data.id;
        const reward_id = this.body.data.relationships.reward.data.id;

        const incl = this.body.included;
        let reward = null;
        for(let i=0; i<incl.length; ++i){
            const attr = incl[i];
            if(attr.id === creator_id){
                if(type === 'delete'){
                    embed.title = 'Canceled $' + (this.body.data.attributes.amount_cents/100).toFixed(2) + ' pledge to ' + attr.attributes.full_name;
                } else {
                    embed.title = 'Pledged $' + (this.body.data.attributes.amount_cents/100).toFixed(2) + ' to ' + attr.attributes.full_name;
                }
                embed.url = attr.attributes.url;
                /*embed.thumbnail = {
                    url: attr.attributes.image_url
                };*/
            } else if(attr.id === patron_id){
                embed.author = {
                    name: attr.attributes.full_name,
                    icon_url: attr.attributes.thumb_url,
                    url: attr.attributes.url
                };
            } else if(attr.id === reward_id){
                reward = attr;
            }
        }
        if(reward != null){
            embed.description = '---';
            const field = {
                name: 'Unlocked \'' + reward.attributes.title + '\'',
                value: '[$' + (reward.attributes.amount_cents/100).toFixed(2) + '+ per month](https://www.patreon.com' + reward.attributes.url + ')\n' + this._formatHTML(reward.attributes.description, embed.url),
                inline: false
            };
            if(type === 'delete'){
                field.name = 'Lost \'' + reward.attributes.title + '\'';
            }
            embed.fields = [field];
        }
        this.payload.addEmbed(embed);
    }

    async pledgesCreate() {
        this._createUpdateCommon('create');
    }

    async pledgesUpdate() {
        this._createUpdateCommon('update');
    }

    async pledgesDelete() {
        this._createUpdateCommon('delete');
    }

}

module.exports = Patreon;