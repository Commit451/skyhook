# skyhook

Parses webhooks and forwards them in the proper format to Discord.

[![Discord](https://discordapp.com/api/guilds/303595820345851905/widget.png)](https://discord.gg/js7wD7p)

## Setup

You can use the [site](https://skyhookapi.com) to create the right webhook link and send a test notification to Discord
before configuring your provider. If you want to manually create the link, here are the steps:

1. Create a webhook in Discord (Server Settings -> Webhooks -> Create Webhook)
2. Copy the webhook url
3. Turn the Discord webhook url into a skyhook webhook url like so:

```
Replace discord.com in url with skyhookapi.com
https://discord.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
->
https://skyhookapi.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook
```

4. Add the provider you want to the end of the url:

```
https://skyhookapi.com/api/webhooks/firstPartOfWebhook/secondPartOfWebhook/providerGoesHere
```

## Supported Providers

- [Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/service-hooks/events?view=azure-devops) - `/azure`
- [AppCenter](https://learn.microsoft.com/en-us/appcenter/dashboard/webhooks/) - `/appcenter`
- [AppVeyor](https://www.appveyor.com/docs/notifications/#webhook-payload-default) - `/appveyor`
- [Basecamp 3](https://github.com/basecamp/bc3-api/blob/master/sections/webhooks.md) - `/basecamp`
- [BitBucket](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) - `/bitbucket`
- [BitBucket Server](https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html) - `/bitbucketserver`
- [Buildkite](https://buildkite.com/docs/apis/webhooks) - `/buildkite`
- [CircleCI](https://circleci.com/docs/1.0/configuration/#notify) - `/circleci`
- [Codacy](https://support.codacy.com/hc/en-us/articles/207280359-WebHook-Notifications) - `/codacy`
- [Confluence](https://developer.atlassian.com/cloud/confluence/modules/webhook/) - `/confluence`
- [Dockerhub](https://docs.docker.com/docker-hub/webhooks) - `/dockerhub`
- [GitLab](https://gitlab.com/help/user/project/integrations/webhooks) - `/gitlab`
- [Heroku](https://devcenter.heroku.com/articles/deploy-hooks#http-post-hook) - `/heroku`
- [Hugging Face](https://huggingface.co/docs/hub/main/webhooks) - `/huggingface`
- [Instana](https://www.instana.com/docs/ecosystem/webhook/) - `/instana`
- [Jenkins](https://plugins.jenkins.io/notification) - `/jenkins` (requires
  the [notification plugin](https://wiki.jenkins.io/display/JENKINS/Notification+Plugin))
- [Jira](https://developer.atlassian.com/server/jira/platform/webhooks/) - `/jira`
- [Linear](https://linear.app/developers/webhooks) - `/linear`
- [NewRelic](https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload) -
  `/newrelic`
- [Patreon](https://www.patreon.com/platform/documentation/webhooks) - `/patreon`
- [Pingdom](https://www.pingdom.com/resources/webhooks) - `/pingdom`
- [RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks) - `/revenuecat`
- [Rollbar](https://docs.rollbar.com/docs/webhooks) - `/rollbar`
- [Shopify](https://shopify.dev/docs/api/webhooks/latest) - `/shopify`
- [Square](https://developer.squareup.com/docs/webhooks/overview) - `/square`
- [Stripe](https://docs.stripe.com/webhooks) - `/stripe`
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format) - `/travis`
- [Trello](https://developers.trello.com/apis/webhooks) - `/trello`
- [Unity Cloud](https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro) - `/unity`
- [Uptime Robot](https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/) - `/uptimerobot`
- [Zendesk](https://developer.zendesk.com/api-reference/webhooks/webhooks-api/webhooks/) - `/zendesk`
<!-- provider-scaffold: supported-providers -->

## Contributing

If you wish to contribute, follow our [contributing guide](CONTRIBUTING.md).

### Creating a Provider

If you want to create a new provider please follow the examples shown at our
small [documentation](docs/CreateNewProvider.md).

To generate a registered provider, canonical fixture, and focused test in one step:

```sh
npm run provider:new -- newprovider NewProvider "New Provider" https://docs.example.com/webhooks
```

## Testing Locally

To build:

```
npm run build
```

To run server (after building):

```
npm start
```

To do both:

```
npm run buildstart
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

## License

skyhook is available under the MIT license. See the LICENSE file for more info.

\ ゜o゜)ノ
