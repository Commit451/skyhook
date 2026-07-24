import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProviderExample, providerExamplePaths } from '../../src/ProviderExamples.ts'

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
]

describe('provider examples', () => {
    it('packages one loadable local example for every registered provider', () => {
        assert.deepEqual(providerExamplePaths, expectedProviderPaths)

        for (const providerPath of providerExamplePaths) {
            const example = loadProviderExample(providerPath)
            assert.equal(typeof example.body, 'object', providerPath)
            assert.notEqual(example.body, null, providerPath)
        }
    })

    it('rejects unknown providers instead of constructing a path from user input', () => {
        assert.throws(() => loadProviderExample('../package'), /No example payload is registered/)
    })
})
