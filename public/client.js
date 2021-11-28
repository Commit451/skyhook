window.mdc.autoInit();

(function (global) {
    'use strict';

    //init snackbar things
    const MDCSnackbar = global.mdc.snackbar.MDCSnackbar;
    const snackbar = new MDCSnackbar(document.getElementById('mdc-js-snackbar'));
    snackbar.timeoutMs = 4000

    const show = function (sb, theMessage) {

        sb.labelText = theMessage
        sb.open();
    };

    const validHookDomains = [
        'discordapp.com',
        'discord.com'
    ];

    $('#button-generate').click(function () {

        let discordHookUrl = $('#url').val();
        let error = true;

        if(discordHookUrl) {
            for(const domain of validHookDomains) {

                if(discordHookUrl.includes(domain)) {

                    const endSpacialPart = discordHookUrl.indexOf(domain);
                    const startSpacialPart = (discordHookUrl.indexOf(':') + 3);// + :// 3 chars:)

                    discordHookUrl = discordHookUrl.replace(discordHookUrl.substring(startSpacialPart, endSpacialPart), '');
                    discordHookUrl = discordHookUrl.replace(`https://${domain}`, window.location.origin);

                    const provider = $('input[name=ex2]:checked').val();
                    discordHookUrl = discordHookUrl + '/' + provider;

                    error = false;
                    break;
                }

            }
        }

        if (!error) {
            window.copyToClipboard(discordHookUrl);
            show(snackbar, 'URL Generated. Copied to Clipboard');
        } else {
            show(snackbar, 'Unable to create URL. Make sure your Discord URL is valid');
        }
    });

})(this);
