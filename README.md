# skyhook
Parses webhooks and forwards them in the proper format to Discord.

## Setup
You can use the [site](https://skyhook.glitch.me/) to create the right webhook link.
1. Create a webhook in Discord (Server Settings -> Webhooks -> Create Webhook)
2. Copy the webhook url
3. Turn the Discord webhook url into a skyhook webhook url like so:
```
Replace discordapp.com in url with skyhook.glitch.me
https://discordapp.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
->
https://skyhook.glitch.me/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
```
4. Add the provider you want to the end of the url:
```
https://skyhook.glitch.me/api/webhooks/firstPartOfWebhook/secondPartOfWebhook/providerGoesHere
```
## Supported Providers
- [GitLab](https://gitlab.com/help/user/project/integrations/webhooks) - `/gitlab`
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format) - `/travis`
- [circleci](https://circleci.com/docs/1.0/configuration/#notify) - `/circleci`
- [AppVeyor](https://www.appveyor.com/docs/notifications/#webhook-payload-default) - `/appveyor`
- [Unity Cloud](https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro) - `/unity`

If you want support for a new provider, just create a pull request and add it!

\ ゜o゜)ノ


## License

skyhook is available under the MIT license. See the LICENSE file for more info.
