# skyhook
Parses webhooks and forwards them in the proper format to Discord.

[![Build Status](https://travis-ci.org/Commit451/skyhook.svg?branch=master)](https://travis-ci.org/Commit451/skyhook) [![Discord](https://discordapp.com/api/guilds/303595820345851905/widget.png)](https://discord.gg/js7wD7p)

## Setup
You can use the [site](https://skyhookapi.com/) to create the right webhook link. If you want to manually do it, here are the steps:
1. Create a webhook in Discord (Server Settings -> Webhooks -> Create Webhook)
2. Copy the webhook url
3. Turn the Discord webhook url into a skyhook webhook url like so:
```
Replace discordapp.com in url with skyhookapi.com
https://discordapp.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
->
https://skyhookapi.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
```
4. Add the provider you want to the end of the url:
```
https://skyhookapi.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook/providerGoesHere
```
## Supported Providers
- [AppVeyor](https://www.appveyor.com/docs/notifications/#webhook-payload-default) - `/appveyor`
- [Bintray](https://bintray.com/docs/api/#_webhooks) - `/bintray`
- [BitBucket](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) - `/bitbucket`
- [BitBucket Server](https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html) - `/bitbucketserver`
- [CircleCI](https://circleci.com/docs/1.0/configuration/#notify) - `/circleci`
- [Codacy](https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications) - `/codacy`
- [Dockerhub](https://docs.docker.com/docker-hub/webhooks) - `/dockerhub`
- [GitLab](https://gitlab.com/help/user/project/integrations/webhooks) - `/gitlab`
- [Heroku](https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook) - `/heroku`
- [Jenkins](https://plugins.jenkins.io/notification) - `/jenkins` (requires the [notification plugin](https://wiki.jenkins.io/display/JENKINS/Notification+Plugin))
- [Jira](https://developer.atlassian.com/server/jira/platform/webhooks/) - `/jira`
- [NewRelic](https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload) - `/newrelic`
- [Patreon](https://www.patreon.com/platform/documentation/webhooks) - `/patreon`
- [Pingdom](https://www.pingdom.com/resources/webhooks) - `/pingdom`
- [Rollbar](https://docs.rollbar.com/docs/webhooks) - `/rollbar`
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format) - `/travis`
- [Trello](https://developers.trello.com/apis/webhooks) - `/trello`
- [Unity Cloud](https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro) - `/unity`
- [Uptime Robot](https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/) - `/uptimerobot`
- [VSTS](https://docs.microsoft.com/en-us/vsts/service-hooks/events#) - `/vsts`

If you want support for a new provider, just create a pull request and add it!  
Alternatively, a new provider can also be requested by creating an [issue](https://github.com/Commit451/skyhook/issues).

## Contributing
If you wish to contribute, follow our [contributing guide](CONTRIBUTING.md).

### Creating a Provider
If you want to create a new provider please follow the examples shown at our small [documentation](docs/CreateNewProvider.md).

## Testing Locally
To run server:
```
npm start
```
To run tests:
```
npm test
```

Through Docker:
```
docker run -it --rm -p 8080:8080 commit451/skyhook
```

## Deploying
- [Docker](docs/docker)
- [Google Cloud](docs/gcloud)

## Thanks
Special thanks to all our amazing contributors. skyhookapi.com is hosted for free for you, so if you feel so inclined, [buy a coffee!](https://ko-fi.com/jawnnypoo)

## License
skyhook is available under the MIT license. See the LICENSE file for more info.

\ ゜o゜)ノ
