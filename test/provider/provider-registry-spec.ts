import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DirectParseProvider } from '../../src/provider/BaseProvider.ts'
import { type ProviderDefinition, ProviderRegistry, providerRegistry } from '../../src/provider/ProviderRegistry.ts'

class DuplicatePathProvider extends DirectParseProvider {
    public getName(): string {
        return 'Duplicate Path'
    }

    public getPath(): string {
        return 'duplicate'
    }

    public async parseData(): Promise<void> {
        this.payload.content = 'duplicate'
    }
}

const duplicateDefinition = (): ProviderDefinition => ({
    path: 'duplicate',
    name: 'Duplicate Path',
    provider: DuplicatePathProvider,
    example: { body: 'gitlab/gitlab.json' },
})

const expectedMetadata = [
    { path: 'appcenter', name: 'AppCenter', example: { body: 'appcenter/appcenter-pipeline.json' } },
    { path: 'appveyor', name: 'AppVeyor', example: { body: 'appveyor/appveyor.json' } },
    { path: 'basecamp', name: 'Basecamp', example: { body: 'basecamp/basecamp.json' } },
    {
        path: 'bitbucket',
        name: 'BitBucket',
        example: { body: 'bitbucket/bitbucket.json', headers: 'bitbucket/bitbucket.headers.json' },
    },
    {
        path: 'bitbucketserver',
        name: 'BitBucketServer',
        example: {
            body: 'bitbucketserver/bitbucketserver.json',
            headers: 'bitbucketserver/bitbucketserver.headers.json',
        },
    },
    {
        path: 'buildkite',
        name: 'Buildkite',
        example: { body: 'buildkite/buildkite.json', headers: 'buildkite/buildkite.headers.json' },
    },
    { path: 'circleci', name: 'CircleCi', example: { body: 'circleci/circleci.json' } },
    { path: 'codacy', name: 'Codacy', example: { body: 'codacy/codacy.json' } },
    { path: 'confluence', name: 'Confluence', example: { body: 'confluence/confluence_page.json' } },
    { path: 'dockerhub', name: 'DockerHub', example: { body: 'dockerhub/dockerhub.json' } },
    { path: 'gitlab', name: 'GitLab', example: { body: 'gitlab/gitlab.json' } },
    { path: 'heroku', name: 'Heroku', example: { body: 'heroku/heroku.json' } },
    { path: 'huggingface', name: 'Hugging Face', example: { body: 'huggingface/huggingface.json' } },
    { path: 'instana', name: 'Instana', example: { body: 'instana/instana.json' } },
    { path: 'jenkins', name: 'Jenkins-CI', example: { body: 'jenkins/jenkins.json' } },
    { path: 'jira', name: 'Jira', example: { body: 'jira/jira-issue.json' } },
    {
        path: 'linear',
        name: 'Linear',
        example: { body: 'linear/linear.json', headers: 'linear/linear.headers.json' },
    },
    { path: 'newrelic', name: 'New Relic', example: { body: 'newrelic/newrelic.json' } },
    {
        path: 'patreon',
        name: 'Patreon',
        example: { body: 'patreon/patreon-member-create.json', headers: 'patreon/patreon.headers.json' },
    },
    { path: 'pingdom', name: 'Pingdom', example: { body: 'pingdom/pingdom.json' } },
    { path: 'rollbar', name: 'Rollbar', example: { body: 'rollbar/rollbar.json' } },
    {
        path: 'shopify',
        name: 'Shopify',
        example: { body: 'shopify/shopify.json', headers: 'shopify/shopify.headers.json' },
    },
    { path: 'square', name: 'Square', example: { body: 'square/square.json' } },
    { path: 'travis', name: 'Travis', example: { body: 'travis/travis.json' } },
    { path: 'trello', name: 'Trello', example: { body: 'trello/trello.json' } },
    { path: 'unity', name: 'Unity Cloud', example: { body: 'unity/unity.json' } },
    { path: 'uptimerobot', name: 'Uptime Robot', example: { body: 'uptimerobot/uptimerobot.json' } },
    { path: 'azure', name: 'Azure DevOps', example: { body: 'azure/azure.json' } },
    { path: 'zendesk', name: 'Zendesk', example: { body: 'zendesk/zendesk.json' } },
]

describe('ProviderRegistry', () => {
    it('rejects duplicate public provider paths instead of overwriting them', () => {
        assert.throws(
            () => new ProviderRegistry([duplicateDefinition(), duplicateDefinition()]),
            /Duplicate provider path "duplicate"/,
        )
    })

    it('rejects registry metadata that disagrees with the provider contract', () => {
        assert.throws(
            () => new ProviderRegistry([{ ...duplicateDefinition(), path: 'wrong-path' }]),
            /Provider path "wrong-path" does not match "duplicate"/,
        )
        assert.throws(
            () => new ProviderRegistry([{ ...duplicateDefinition(), name: 'Wrong Name' }]),
            /Provider name "Wrong Name" does not match "Duplicate Path"/,
        )
    })

    it('preserves provider order, public metadata, and example file mappings', () => {
        assert.deepEqual(
            providerRegistry.definitions.map(({ path, name, example }) => ({ path, name, example })),
            expectedMetadata,
        )
        assert.deepEqual(
            providerRegistry.providerInfos,
            expectedMetadata.map(({ name, path }) => ({ name, path })),
        )
    })

    it('looks providers up by their public path', () => {
        const gitlab = providerRegistry.get('gitlab')

        assert.equal(gitlab?.name, 'GitLab')
        assert.strictEqual(gitlab, providerRegistry.definitions[10])
        assert.equal(providerRegistry.get('not-registered'), undefined)
    })

    it('publishes Azure DevOps at /azure without a legacy /vsts alias', () => {
        assert.equal(providerRegistry.get('azure')?.name, 'Azure DevOps')
        assert.equal(providerRegistry.get('vsts'), undefined)
    })
})
