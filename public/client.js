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
            discordHookUrl = discordHookUrl.replace("discordapp.com", "skyhook.glitch.me");
            //add the provider
            var index = 0;
            //loop on all radios, seeing which one is checked
            var radios = document.querySelectorAll('.mdc-radio__native-control');
            for (var i = 0, radio; radio = radios[i]; i++) {
                if (radio.checked === true) {
                    index = i;
                }
            }
            switch (index) {
                case 0:
                    discordHookUrl = discordHookUrl + "/appveyor";
                    break;
                case 1:
                    discordHookUrl = discordHookUrl + "/bitbucket";
                    break;
                case 2:
                    discordHookUrl = discordHookUrl + "/circleci";
                    break;
                case 3:
                    discordHookUrl = discordHookUrl + "/gitlab";
                    break;
                case 4:
                    discordHookUrl = discordHookUrl + "/heroku";
                    break;
                case 5:
                    discordHookUrl = discordHookUrl + "/travis";
                    break;
                case 6:
                    discordHookUrl = discordHookUrl + "/unity";
                    break;

                default:
                    error = true;
                    break;
            }
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
