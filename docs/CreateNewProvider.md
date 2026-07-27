# Creating a provider

A provider is a stateless definition that maps one normalized third-party webhook request into a Discord payload draft. Shared infrastructure owns request normalization, ignored-event handling, defaults, mention suppression, Discord limits, the Skyhook footer, and final validation.

Provider files should therefore contain only third-party semantics: validate the relevant envelope, interpret the event, and describe the notification.

## Fastest path: generate the provider skeleton

Run the scaffold command with the public route, TypeScript export name, display name, and official HTTPS documentation URL:

```sh
npm run provider:new -- newprovider NewProvider "New Provider" https://docs.example.com/webhooks
```

The command refuses to overwrite existing paths and creates or updates everything needed for a working baseline:

- `src/provider/NewProvider.ts`
- `examples/newprovider/newprovider.json`
- `test/newprovider/newprovider-spec.ts`
- the import and definition entry in `ProviderRegistry.ts`
- the supported-provider entry in `README.md`

Customize the generated mapper and canonical fixture, then run `npm test`. The repository-wide provider contract suite automatically checks the metadata, packaged example, mention policy, and finalized Discord payload for every registered provider.

Provider modules should import only the public `./Provider.ts` facade. The implementation under `src/provider/core/` is internal infrastructure and can change without changing provider authoring code.

## Direct providers

Use `defineProvider` when the request has one mapping path:

```ts
import { scalarText } from '../util/WebhookValue.ts'
import { defineProvider } from './Provider.ts'

export const NewProvider = defineProvider({
    path: 'newprovider',
    name: 'New Provider',
    example: { body: 'newprovider/newprovider.json' },
    defaults: {
        username: 'New Provider',
        avatarUrl: 'https://example.com/avatar.png',
        embedColor: 0x123456,
    },
    map({ body }, output) {
        const summary = scalarText(body.summary)
        if (summary == null) {
            output.ignore()
            return
        }

        output.addEmbed({
            title: 'New webhook event',
            description: summary,
        })
    },
})
```

`map` may be synchronous or asynchronous. Do not start detached work that outlives the returned promise.

## Event providers

Use `defineEventProvider` when a body property or header selects one of several event mappings:

```ts
import { defineEventProvider } from './Provider.ts'

export const NewProvider = defineEventProvider({
    path: 'newprovider',
    name: 'New Provider',
    example: {
        body: 'newprovider/newprovider.json',
        headers: 'newprovider/newprovider.headers.json',
    },
    event: ({ headers }) => headers.get('x-new-provider-event'),
    handlers: {
        'build.finished': ({ body }, output) => {
            output.addEmbed({
                title: 'Build finished',
                description: String(body.summary ?? ''),
            })
        },
        deployment_failed: (_request, output) => {
            output.addEmbed({ title: 'Deployment failed' })
        },
    },
})
```

Handler keys are the **exact raw third-party event names**. They are not camel-cased or converted, and there is no reflective method dispatch or separate event allowlist. A missing selector or unknown event returns `null` automatically. Use `fallback` only when the provider deliberately supports future event names generically.

For a simple body selector, `event` may be the property name:

```ts
event: 'event_type'
```

## Request and output API

Every mapper receives:

- `body` — a non-null, non-array JSON object. Invalid root values are ignored before mapping.
- `headers` — a fresh, case-insensitive `Headers` object.
- `query` — a fresh `URLSearchParams` object.
- `http` — the provider's policy-bound JSON HTTP capability.
- `output.payload` — the Discord payload draft.
- `output.addEmbed(embed)` — appends an embed and applies the current default color.
- `output.setEmbedColor(color)` — changes the default color for subsequently added embeds.
- `output.ignore()` — marks the webhook as ignored and causes execution to return `null`.
- `output.logger` — the shared logger for sanitized diagnostics.

Definitions and metadata are immutable, while every execution receives a fresh `ProviderOutput`. Do not retain request or output values in module-level state.

Returning normally finalizes the draft. Throwing indicates a parsing failure and follows the endpoint's sanitized error path. Ignoring an unsupported event remains a successful HTTP 200 path.

A mapper must either add message content, add at least one embed, or call `output.ignore()`. Returning an empty draft throws a provider implementation error instead of sending an unusable Discord request.

## Safe webhook values

Use shared semantic helpers instead of adding provider-local coercion functions:

- `src/util/WebhookValue.ts`
  - `isRecord`
  - `scalarText` and `firstScalar`
  - `safeId`
  - `safeIntegerText`
  - `canonicalizeIso8601Timestamp` and `firstIso8601Timestamp`
  - `trustedHttpsUrl` and `isAllowedHostname`
- `src/util/DiscordText.ts`
  - text cleanup and bounded truncation
  - literal Discord Markdown escaping
  - identifier humanization
- `src/util/DiscordEmbed.ts`
  - Discord limits
  - bounded literal fields
  - shared Skyhook footer constants

Do not stringify arbitrary objects into notifications. Distinguish untrusted literal text from Markdown intentionally constructed by the provider: escape the former, but preserve trusted provider-generated formatting such as links.

Use `trustedHttpsUrl` for links derived from webhook input. Declare the exact trusted hostnames and opt into subdomains only when the third-party service requires them.

## Outbound HTTP

Providers cannot make outbound requests unless their definition explicitly declares an HTTP policy:

```ts
export const NewProvider = defineProvider({
    // ...metadata...
    http: {
        allowedHosts: ['api.example.com'],
        timeoutMs: 5_000,
        maxResponseBytes: 128_000,
    },
    async map({ body, http }, output) {
        const details = await http.getJson<{ title: string }>(String(body.details_url))
        output.addEmbed({ title: details.title })
    },
})
```

`http.getJson` centrally enforces:

- HTTPS
- exact hostname allowlists
- no URL credentials or non-default ports
- a maximum 10-second timeout
- a maximum 1 MB response size
- streaming cancellation as soon as the response exceeds its byte budget
- no redirects
- successful HTTP status
- JSON parsing

Do not call global `fetch` from a provider. Catch enrichment errors only when a safe, useful fallback notification exists; otherwise allow the error to follow the normal sanitized failure path.

## Central Discord finalization

Providers create drafts rather than manually enforcing every Discord constraint. Finalization applies:

- default username, avatar, and embed color
- `allowed_mentions: { parse: [] }` for every provider payload
- the Skyhook footer
- 2,000-character message content
- at most 10 embeds
- at most 25 fields per embed
- title, description, field, and author component limits
- the aggregate 6,000-character budget across every embed in the message
- omission of invalid optional values

The aggregate budget includes titles, descriptions, author names, footer text, field names, and field values across the complete message—not 6,000 characters per embed.

Providers should still bound and select data semantically. Central truncation is a final safety boundary, not a substitute for deciding which third-party fields are useful.

## Metadata, registration, and examples

Provider metadata is declared once, on the definition:

```ts
export const NewProvider = defineProvider({
    path: 'newprovider',
    name: 'New Provider',
    example: {
        body: 'newprovider/newprovider.json',
        headers: 'newprovider/newprovider.headers.json', // optional
        query: 'newprovider/newprovider.query.json',     // optional
    },
    map(_request, output) {
        output.addEmbed({ title: 'Example' })
    },
})
```

The scaffold command performs registration automatically. To register a provider manually:

1. Add the provider under `src/provider/`.
2. Add one canonical body under `examples/<path>/`.
3. Add canonical headers or query JSON when required.
4. Import the definition in `src/provider/ProviderRegistry.ts`.
5. Add the definition itself to `providerDefinitions` in the intended public order.
6. Add the provider to the supported-provider list in `README.md`.

Do not duplicate the path, name, or example mapping in the registry. The registry rejects duplicate public paths, while routes, `/api/providers`, and example loading derive from definition metadata.

Keep additional edge-case payloads under `test/<path>/`; only the canonical hosted example belongs under `examples/`.

## Tests

Use `Tester` with the definition directly:

```ts
const result = await Tester.test(NewProvider, 'newprovider.json', {
    'x-new-provider-event': 'build.finished',
})
```

Prefer exact assertions for titles, descriptions, fields, authors, URLs, timestamps, colors, footers, and ignored-event behavior—not only embed counts. Cover malformed roots and envelopes, unknown events, asynchronous completion, trusted URL policy, untrusted Markdown, long values, and HTTP fallbacks where relevant.

`test/provider/provider-contract-spec.ts` runs the canonical fixture for every registry definition. It catches missing fixtures, empty examples, invalid metadata, mutable definitions, unsafe mentions, and Discord limit regressions without requiring provider-specific boilerplate.

Use Node 24 and run:

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```
