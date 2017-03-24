# skyhook

Parses webhooks and forwards them in the proper format to Discord.

## Setup
1. Create a webhook in Discord (Server Settings -> Webhooks -> Create Webhook)
2. Copy the webhook url
3. Turn the Discord webhook url into a skyhook webhook url like so:
```
Replace discordapp.com in url with skyhook.glitch.me
https://discordapp.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
->
https://skyhook.glitch.me/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
```

## Supported Providers
- [GitLab](https://gitlab.com/help/user/project/integrations/webhooks)
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format)


\ ゜o゜)ノ


License
--------
Copyright 2017 Commit 451

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.