import { AppCenter } from './AppCenter.ts'
import { AppVeyor } from './Appveyor.ts'
import { AzureDevOps } from './AzureDevOps.ts'
import { Basecamp } from './Basecamp.ts'
import type { BaseProvider } from './BaseProvider.ts'
import { BitBucketServer } from './BitBucketServer.ts'
import { BitBucket } from './Bitbucket.ts'
import { Buildkite } from './Buildkite.ts'
import { CircleCi } from './CircleCi.ts'
import { Codacy } from './Codacy.ts'
import { Confluence } from './Confluence.ts'
import { DockerHub } from './DockerHub.ts'
import { GitLab } from './GitLab.ts'
import { Heroku } from './Heroku.ts'
import { HuggingFace } from './HuggingFace.ts'
import { Instana } from './Instana.ts'
import { Jenkins } from './Jenkins.ts'
import { Jira } from './Jira.ts'
import { Linear } from './Linear.ts'
import { NewRelic } from './NewRelic.ts'
import { Patreon } from './Patreon.ts'
import { Pingdom } from './Pingdom.ts'
import { Rollbar } from './Rollbar.ts'
import { Shopify } from './Shopify.ts'
import { Square } from './Square.ts'
import { Travis } from './Travis.ts'
import { Trello } from './Trello.ts'
import { Unity } from './Unity.ts'
import { UptimeRobot } from './UptimeRobot.ts'
import { Zendesk } from './Zendesk.ts'

export type ProviderConstructor = new () => BaseProvider

export interface ProviderExampleFiles {
    readonly body: string
    readonly headers?: string
    readonly query?: string
}

export interface ProviderDefinition {
    readonly path: string
    readonly name: string
    readonly provider: ProviderConstructor
    readonly example: ProviderExampleFiles
}

export interface ProviderInfo {
    readonly name: string
    readonly path: string
}

export class ProviderRegistry {
    public readonly definitions: readonly ProviderDefinition[]
    public readonly providerInfos: readonly ProviderInfo[]
    private readonly definitionsByPath: ReadonlyMap<string, ProviderDefinition>

    public constructor(definitions: readonly ProviderDefinition[]) {
        const definitionsByPath = new Map<string, ProviderDefinition>()
        const registeredDefinitions: ProviderDefinition[] = []

        for (const input of definitions) {
            if (definitionsByPath.has(input.path)) {
                throw new Error(`Duplicate provider path "${input.path}".`)
            }

            const provider = new input.provider()
            const providerPath = provider.getPath()
            if (providerPath !== input.path) {
                throw new Error(`Provider path "${input.path}" does not match "${providerPath}".`)
            }
            const providerName = provider.getName()
            if (providerName !== input.name) {
                throw new Error(`Provider name "${input.name}" does not match "${providerName}".`)
            }

            const definition = Object.freeze({
                ...input,
                example: Object.freeze({ ...input.example }),
            })
            definitionsByPath.set(definition.path, definition)
            registeredDefinitions.push(definition)
        }

        this.definitionsByPath = definitionsByPath
        this.definitions = Object.freeze(registeredDefinitions)
        this.providerInfos = Object.freeze(registeredDefinitions.map(({ name, path }) => Object.freeze({ name, path })))
    }

    public get(path: string): ProviderDefinition | undefined {
        return this.definitionsByPath.get(path)
    }

    public has(path: string): boolean {
        return this.definitionsByPath.has(path)
    }
}

const providerDefinitions: readonly ProviderDefinition[] = [
    {
        path: 'appcenter',
        name: 'AppCenter',
        provider: AppCenter,
        example: { body: 'appcenter/appcenter-pipeline.json' },
    },
    {
        path: 'appveyor',
        name: 'AppVeyor',
        provider: AppVeyor,
        example: { body: 'appveyor/appveyor.json' },
    },
    {
        path: 'basecamp',
        name: 'Basecamp',
        provider: Basecamp,
        example: { body: 'basecamp/basecamp.json' },
    },
    {
        path: 'bitbucket',
        name: 'BitBucket',
        provider: BitBucket,
        example: {
            body: 'bitbucket/bitbucket.json',
            headers: 'bitbucket/bitbucket.headers.json',
        },
    },
    {
        path: 'bitbucketserver',
        name: 'BitBucketServer',
        provider: BitBucketServer,
        example: {
            body: 'bitbucketserver/bitbucketserver.json',
            headers: 'bitbucketserver/bitbucketserver.headers.json',
        },
    },
    {
        path: 'buildkite',
        name: 'Buildkite',
        provider: Buildkite,
        example: {
            body: 'buildkite/buildkite.json',
            headers: 'buildkite/buildkite.headers.json',
        },
    },
    {
        path: 'circleci',
        name: 'CircleCi',
        provider: CircleCi,
        example: { body: 'circleci/circleci.json' },
    },
    {
        path: 'codacy',
        name: 'Codacy',
        provider: Codacy,
        example: { body: 'codacy/codacy.json' },
    },
    {
        path: 'confluence',
        name: 'Confluence',
        provider: Confluence,
        example: { body: 'confluence/confluence_page.json' },
    },
    {
        path: 'dockerhub',
        name: 'DockerHub',
        provider: DockerHub,
        example: { body: 'dockerhub/dockerhub.json' },
    },
    {
        path: 'gitlab',
        name: 'GitLab',
        provider: GitLab,
        example: { body: 'gitlab/gitlab.json' },
    },
    {
        path: 'heroku',
        name: 'Heroku',
        provider: Heroku,
        example: { body: 'heroku/heroku.json' },
    },
    {
        path: 'huggingface',
        name: 'Hugging Face',
        provider: HuggingFace,
        example: { body: 'huggingface/huggingface.json' },
    },
    {
        path: 'instana',
        name: 'Instana',
        provider: Instana,
        example: { body: 'instana/instana.json' },
    },
    {
        path: 'jenkins',
        name: 'Jenkins-CI',
        provider: Jenkins,
        example: { body: 'jenkins/jenkins.json' },
    },
    {
        path: 'jira',
        name: 'Jira',
        provider: Jira,
        example: { body: 'jira/jira-issue.json' },
    },
    {
        path: 'linear',
        name: 'Linear',
        provider: Linear,
        example: {
            body: 'linear/linear.json',
            headers: 'linear/linear.headers.json',
        },
    },
    {
        path: 'newrelic',
        name: 'New Relic',
        provider: NewRelic,
        example: { body: 'newrelic/newrelic.json' },
    },
    {
        path: 'patreon',
        name: 'Patreon',
        provider: Patreon,
        example: {
            body: 'patreon/patreon-member-create.json',
            headers: 'patreon/patreon.headers.json',
        },
    },
    {
        path: 'pingdom',
        name: 'Pingdom',
        provider: Pingdom,
        example: { body: 'pingdom/pingdom.json' },
    },
    {
        path: 'rollbar',
        name: 'Rollbar',
        provider: Rollbar,
        example: { body: 'rollbar/rollbar.json' },
    },
    {
        path: 'shopify',
        name: 'Shopify',
        provider: Shopify,
        example: {
            body: 'shopify/shopify.json',
            headers: 'shopify/shopify.headers.json',
        },
    },
    {
        path: 'square',
        name: 'Square',
        provider: Square,
        example: { body: 'square/square.json' },
    },
    {
        path: 'travis',
        name: 'Travis',
        provider: Travis,
        example: { body: 'travis/travis.json' },
    },
    {
        path: 'trello',
        name: 'Trello',
        provider: Trello,
        example: { body: 'trello/trello.json' },
    },
    {
        path: 'unity',
        name: 'Unity Cloud',
        provider: Unity,
        example: { body: 'unity/unity.json' },
    },
    {
        path: 'uptimerobot',
        name: 'Uptime Robot',
        provider: UptimeRobot,
        example: { body: 'uptimerobot/uptimerobot.json' },
    },
    {
        path: 'azure',
        name: 'Azure DevOps',
        provider: AzureDevOps,
        example: { body: 'azure/azure.json' },
    },
    {
        path: 'zendesk',
        name: 'Zendesk',
        provider: Zendesk,
        example: { body: 'zendesk/zendesk.json' },
    },
]

export const providerRegistry = new ProviderRegistry(providerDefinitions)
