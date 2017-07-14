# skyhook
Parses webhooks and forwards them in the proper format to Discord.

[![Build Status](https://travis-ci.org/Commit451/skyhook.svg?branch=master)](https://travis-ci.org/Commit451/skyhook) [![Discord](https://img.shields.io/discord/303595820345851905.svg)](https://discord.gg/js7wD7p)

## Setup
You can use the [site](https://skyhook.glitch.me/) to create the right webhook link. If you want to manually do it, here are the steps:
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
- [AppVeyor](https://www.appveyor.com/docs/notifications/#webhook-payload-default) - `/appveyor`
- [BitBucket](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) - `/bitbucket`
- [circleci](https://circleci.com/docs/1.0/configuration/#notify) - `/circleci`
- [GitLab](https://gitlab.com/help/user/project/integrations/webhooks) - `/gitlab`
- [Heroku](https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook) - `/heroku`
- [Jenkins](https://plugins.jenkins.io/notification) - `/jenkins` (requires the [notification plugin](https://wiki.jenkins.io/display/JENKINS/Notification+Plugin))
- [Patreon](https://www.patreon.com/platform/documentation/webhooks) - `/patreon`
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format) - `/travis`
- [Trello](https://developers.trello.com/apis/webhooks) - `/trello`
- [Unity Cloud](https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro) - `/unity`

If you want support for a new provider, just create a pull request and add it!  
Alternatively, a new provider can also be requested by creating an [issue](https://github.com/Commit451/skyhook/issues).

### Creating a Provider
If you want to create a new provider please follow the examples shown at our small [documentation](docs/CreateNewProvider.md).

\ ゜o゜)ノ

## Testing Locally
To run server:
```
npm start
```
To run tests:
```
npm test
```

## License

skyhook is available under the MIT license. See the LICENSE file for more info.
