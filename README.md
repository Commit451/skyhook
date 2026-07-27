# skyhook

Parses webhooks and forwards them in the proper format to Discord.

[![Discord](https://discordapp.com/api/guilds/303595820345851905/widget.png)](https://discord.gg/js7wD7p)

## Setup

You can use the [site](https://skyhookapi.com) to create the right webhook link and send a test
notification to Discord before configuring your provider. If you want to manually create the link,
here are the steps:

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
- [Rollbar](https://docs.rollbar.com/docs/webhooks) - `/rollbar`
- [Shopify](https://shopify.dev/docs/api/webhooks/latest) - `/shopify`
- [Square](https://developer.squareup.com/docs/webhooks/overview) - `/square`
- [Travis](https://docs.travis-ci.com/user/notifications/#Webhooks-Delivery-Format) - `/travis`
- [Trello](https://developers.trello.com/apis/webhooks) - `/trello`
- [Unity Cloud](https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro) - `/unity`
- [Uptime Robot](https://blog.uptimerobot.com/web-hook-alert-contacts-new-feature/) - `/uptimerobot`
- [Zendesk](https://developer.zendesk.com/api-reference/webhooks/webhooks-api/webhooks/) - `/zendesk`

### Linear setup

Create a webhook in Linear's API settings and use the generated `/linear` URL as its endpoint. You can subscribe the webhook to all public teams or one team and select any supported resource types. Skyhook formats Linear data-change events (including issues, comments, projects, cycles, documents, initiatives, customers, and users) as well as Issue SLA and OAuth app revocation events.

Linear signatures use a secret that belongs to the configured webhook. Skyhook's generated URL does not include or store that secret, so Skyhook cannot verify `Linear-Signature`; all incoming values are treated as untrusted display data and Discord mentions are disabled.

### Square setup

Create a subscription in the Square Developer Console and use the generated `/square` URL as its notification URL. Select any supported Square webhook events; Skyhook formats Square's common event envelope, including current and future event families, into a bounded Discord notification.

Square signatures require the subscription's signature key, the exact notification URL, and the raw request body. Skyhook does not store that key and therefore cannot verify `x-square-hmacsha256-signature`; all incoming values are treated as untrusted display data and Discord mentions are disabled.

### Zendesk setup

Use the generated `/zendesk` URL as the endpoint for a Zendesk webhook that subscribes directly to Zendesk events. Configure the webhook to use `POST` with the `json` request format, then select the event subscriptions you want delivered to Discord. Skyhook supports the standard Zendesk event schema across ticket, user, organization, article, and future event domains.

Zendesk trigger and automation webhooks are not automatically parsed because their request payload is administrator-defined. Connect the webhook through event subscriptions instead.

If you want support for a new provider, just create a pull request and add it!  
Alternatively, a new provider can also be requested by creating an [issue](https://github.com/Commit451/skyhook/issues).

### Square setup

Use the generated `/square` URL as the endpoint for a Square webhook subscription. In your Square Developer Dashboard, create a subscription that delivers event notifications for the event types you want (such as `payment.created`, `order.created`, `customer.created`, `refund.created`, and so on).

Square signs each delivery with an HMAC signature delivered via the `x-square-hmacsha256-signature` header, using a signature key that is specific to the configured webhook. Skyhook's generated URL does not include or store that signature key, so Skyhook cannot verify Square signatures; all incoming payload values are treated as untrusted display data and Discord mentions are disabled.

The type of each event is read from the top-level `type` field (for example `payment.created`). Skyhook formats the most common Square event types — payments, refunds, orders, customers, disputes, payouts, invoices, subscriptions, gift cards, and more — into resource-specific Discord notifications. Any Square event type that does not have a dedicated handler falls back to a generic summary so you always see a notification.

## Contributing

If you wish to contribute, follow our [contributing guide](CONTRIBUTING.md).

### Creating a Provider

If you want to create a new provider please follow the examples shown at our
small [documentation](docs/CreateNewProvider.md).

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

## Thanks

Special thanks to all our amazing contributors. skyhookapi.com is hosted for free for you, so if you feel so
inclined, [buy a coffee!](https://ko-fi.com/jawnnypoo)

## License

skyhook is available under the MIT license. See the LICENSE file for more info.

\ ゜o゜)ノ
