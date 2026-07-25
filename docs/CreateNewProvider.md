# Creating a provider

A provider converts one third-party webhook request into a Discord payload. The HTTP routes and packaged examples execute providers through `ProviderRunner`, so every request gets a fresh provider instance, asynchronous parsing is awaited, and the result is checked by the report-only Discord validator.

## Provider state

A provider receives these protected values before parsing:

- `this.body` — parsed JSON or form body.
- `this.headers` — request headers, or `null` in direct tests/examples without headers.
- `this.query` — query parameters, or `null` when absent.
- `this.payload` — the `DiscordPayload` being built.
- `this.logger` — the shared Skyhook logger.

Do not retain request data outside the provider instance. `ProviderRunner` constructs a fresh instance for every execution.

## Direct providers

Use `DirectParseProvider` when every webhook uses one parsing path:

```ts
import { DirectParseProvider } from './BaseProvider.ts'

export class NewProvider extends DirectParseProvider {
    public getName(): string {
        return 'NewProvider'
    }

    // Override only when the public URL path is not getName().toLowerCase().
    public getPath(): string {
        return 'newprovider'
    }

    public async parseData(): Promise<void> {
        if (this.body == null || typeof this.body !== 'object') {
            this.nullifyPayload()
            return
        }

        this.setEmbedColor(0x123456)
        this.addEmbed({
            title: 'New webhook event',
            description: String(this.body.summary ?? ''),
        })
    }
}
```

`parseData()` may perform asynchronous work. It must return a `Promise<void>`; do not start detached work after it returns. Bound every outbound request with an `AbortSignal` timeout. `addEmbed()` applies the shared Skyhook footer and configured color.

Call `this.nullifyPayload()` for malformed, ignored, or unsupported input. Parsing then returns `null`, later lifecycle hooks are skipped safely, and the live endpoint responds with the existing unsupported-event text and HTTP 200.

## Event-based providers

Use `TypeParseProvider` when a header or body property selects an event handler:

```ts
import { TypeParseProvider } from './BaseProvider.ts'

export class NewProvider extends TypeParseProvider {
    public getName(): string {
        return 'NewProvider'
    }

    public getType(): string | null {
        return this.headers?.['x-new-provider-event'] ?? null
    }

    public knownTypes(): string[] {
        return ['buildComplete', 'deploymentFailed']
    }

    public async buildComplete(): Promise<void> {
        this.addEmbed({ title: 'Build completed' })
    }

    public async deploymentFailed(): Promise<void> {
        this.addEmbed({ title: 'Deployment failed' })
    }
}
```

`getType()` is normalized with `TypeParseProvider.formatType()`: colons, dots, underscores, hyphens, and spaces become a camel-cased handler name. For example, `build.complete` becomes `buildComplete`.

Every callable event handler must be explicitly listed in `knownTypes()`. This list is the dispatch allowlist; unlisted events and listed events without a matching function are ignored. Keep labels, URLs, colors, and third-party interpretation inside the provider rather than in shared infrastructure.

## Discord text and limits

Use the semantic helpers instead of introducing provider-local copies:

- `src/util/DiscordText.ts` — text cleanup, bounded truncation, literal Markdown escaping, and identifier humanization.
- `src/util/DiscordEmbed.ts` — Discord limits, the shared Skyhook footer, and bounded literal embed fields.
- `src/util/WebhookValue.ts` — record checks, scalar/identifier normalization, and strict ISO timestamp handling.

Current shared limits are:

- Message content: 2,000 characters.
- Embeds per message: 10.
- Text across all embeds in one message: 6,000 characters.
- Embed title: 256; description: 4,096.
- Field count: 25; field name: 256; field value: 1,024.
- Author name: 256; footer text: 2,048.

The 6,000-character budget applies to the combined title, description, author name, footer text, and field names/values across every embed in the message—not separately to each embed.

`ProviderRunner` calls `validateDiscordPayload()` after a non-null parse and logs structured warnings. Validation is intentionally report-only: it does not mutate, truncate, split, reject, or repair legacy output. New providers should nevertheless produce clean validation results. Choose truncation, omission, splitting, or rejection deliberately for that provider rather than relying on the runner.

Escape untrusted literal Markdown, but do not escape trusted Markdown that the provider intentionally constructs, such as its own links. Do not replace provider-specific HTML conversion unless tests prove the output is equivalent.

## Registering the provider and example

Provider registration is explicit; the runtime does not scan the provider directory.

1. Add the provider source under `src/provider/`.
2. Add one canonical body under `examples/<path>/`.
3. Add canonical headers and query JSON files when the provider needs them.
4. Import the provider in `src/provider/ProviderRegistry.ts`.
5. Add one `ProviderDefinition` in the intended public order:

```ts
{
    path: 'newprovider',
    name: 'NewProvider',
    provider: NewProvider,
    example: {
        body: 'newprovider/newprovider.json',
        headers: 'newprovider/newprovider.headers.json', // optional
        query: 'newprovider/newprovider.query.json',     // optional
    },
},
```

The registry rejects duplicate public paths and metadata that disagrees with `getPath()` or `getName()`. `/api/providers`, live routing, and example lookup all derive from this registry.

Keep additional edge-case payloads under `test/<path>/`; only the canonical hosted example belongs under `examples/`.

## Tests

Add or update:

- `test/<path>/<path>-spec.ts` with exact assertions for titles, descriptions, fields, author, URL, footer, and color—not only embed counts.
- `test/provider/provider-registry-spec.ts` expected metadata.
- `test/examples/examples-spec.ts` expected provider path order.

Cover asynchronous completion, malformed input, unsupported events, provider-specific fallbacks, and Discord boundary behavior where relevant. Characterize odd legacy behavior before refactoring it.

Use Node 24 (the version in `.nvmrc`) and run:

```sh
. "$HOME/.nvm/nvm.sh"
nvm use 24
npm test
npm run lint
npx tsc --noEmit
npm run build
cd web
npm test
npm run build
```
