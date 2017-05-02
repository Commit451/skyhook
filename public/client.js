// client-side js
// run by the browser each time your view template is loaded


window.mdc.autoInit();

(function (global) {
    'use strict';

    //init snackbar things
    var MDCSnackbar = global.mdc.snackbar.MDCSnackbar;
    var snackbar = new MDCSnackbar(document.getElementById('mdc-js-snackbar'));

    var show = function (sb, theMessage) {
        var data = {
            message: theMessage,
            multiline: false
        };

        sb.show(data);
    }

    $("#button-generate").click(function () {
        var discordHookUrl = $('#url').val();
        var error = false;
        if (discordHookUrl && discordHookUrl.includes("discordapp.com")) {

            var endSpacialPart = discordHookUrl.indexOf("discordapp.com")
            var startSpacialPart = (discordHookUrl.indexOf(":") + 3);// + :// 3 chars:)

            discordHookUrl = discordHookUrl.replace(discordHookUrl.substring(startSpacialPart, endSpacialPart), "");
            discordHookUrl = discordHookUrl.replace("discordapp.com", "skyhook.glitch.me");

            var provider = $('input[name=ex2]:checked').val();
            discordHookUrl = discordHookUrl + "/" + provider;
        } else {
            error = true;
        }

        if (!error) {
            window.copyToClipboard(discordHookUrl);
            show(snackbar, "URL Generated. Copied to Clipboard");
        } else {
            show(snackbar, "Unable to create URL. Make sure your Discord URL is valid");
        }
    });

})(this);
