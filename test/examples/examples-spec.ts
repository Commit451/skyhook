import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProviderExample, providerExamplePaths } from '../../src/ProviderExamples.ts'
import { DirectParseProvider } from '../../src/provider/BaseProvider.ts'
import { ProviderRegistry, providerRegistry } from '../../src/provider/ProviderRegistry.ts'

class ExampleAliasProvider extends DirectParseProvider {
    public getName(): string {
        return 'Example Alias'
    }

    public getPath(): string {
        return 'example-alias'
    }

    public async parseData(): Promise<void> {
        this.payload.content = 'example'
    }
}

const expectedProviderPaths = [
    'appcenter',
    'appveyor',
    'basecamp',
    'bitbucket',
    'bitbucketserver',
    'circleci',
    'codacy',
    'confluence',
    'dockerhub',
    'gitlab',
    'heroku',
    'huggingface',
    'instana',
    'jenkins',
    'jira',
    'newrelic',
    'patreon',
    'pingdom',
    'rollbar',
    'shopify',
    'travis',
    'trello',
    'unity',
    'uptimerobot',
    'vsts',
    'zendesk',
]

describe('provider examples', () => {
    it('packages one loadable local example for every registered provider', () => {
        assert.deepEqual(providerExamplePaths, expectedProviderPaths)
        assert.deepEqual(
            providerExamplePaths,
            providerRegistry.definitions.map(({ path }) => path),
        )

        for (const providerPath of providerExamplePaths) {
            const example = loadProviderExample(providerPath)
            assert.equal(typeof example.body, 'object', providerPath)
            assert.notEqual(example.body, null, providerPath)
        }
    })

    it('resolves example files from the supplied registry', () => {
        const registry = new ProviderRegistry([
            {
                path: 'example-alias',
                name: 'Example Alias',
                provider: ExampleAliasProvider,
                example: { body: 'gitlab/gitlab.json' },
            },
        ])

        const example = loadProviderExample('example-alias', registry)

        assert.equal(example.body.object_kind, 'push')
    })

    it('rejects unknown providers instead of constructing a path from user input', () => {
        assert.throws(() => loadProviderExample('../package'), /No example payload is registered/)
    })
})
