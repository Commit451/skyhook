import { AppCenter } from './AppCenter.ts'
import { AppVeyor } from './Appveyor.ts'
import { AzureDevOps } from './AzureDevOps.ts'
import { Basecamp } from './Basecamp.ts'
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
import type { ProviderDefinition } from './Provider.ts'
import { Rollbar } from './Rollbar.ts'
import { Shopify } from './Shopify.ts'
import { Square } from './Square.ts'
import { Stripe } from './Stripe.ts'
import { Travis } from './Travis.ts'
import { Trello } from './Trello.ts'
import { Unity } from './Unity.ts'
import { UptimeRobot } from './UptimeRobot.ts'
import { Zendesk } from './Zendesk.ts'

// provider-scaffold: imports

export type { ProviderDefinition } from './Provider.ts'

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

        for (const definition of definitions) {
            if (definitionsByPath.has(definition.path)) {
                throw new Error(`Duplicate provider path "${definition.path}".`)
            }
            definitionsByPath.set(definition.path, definition)
        }

        this.definitionsByPath = definitionsByPath
        this.definitions = Object.freeze([...definitions])
        this.providerInfos = Object.freeze(definitions.map(({ name, path }) => Object.freeze({ name, path })))
    }

    public get(path: string): ProviderDefinition | undefined {
        return this.definitionsByPath.get(path)
    }

    public has(path: string): boolean {
        return this.definitionsByPath.has(path)
    }
}

const providerDefinitions: readonly ProviderDefinition[] = [
    AppCenter,
    AppVeyor,
    Basecamp,
    BitBucket,
    BitBucketServer,
    Buildkite,
    CircleCi,
    Codacy,
    Confluence,
    DockerHub,
    GitLab,
    Heroku,
    HuggingFace,
    Instana,
    Jenkins,
    Jira,
    Linear,
    NewRelic,
    Patreon,
    Pingdom,
    Rollbar,
    Shopify,
    Square,
    Stripe,
    Travis,
    Trello,
    Unity,
    UptimeRobot,
    AzureDevOps,
    Zendesk,
    // provider-scaffold: definitions
]

export const providerRegistry = new ProviderRegistry(providerDefinitions)
