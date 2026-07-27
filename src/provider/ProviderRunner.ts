import type { DiscordPayload } from '../model/DiscordApi.ts'
import { loadProviderExample } from '../ProviderExamples.ts'
import { validateDiscordPayload } from '../util/DiscordPayloadValidator.ts'
import { type Logger, logger } from '../util/logger.ts'
import { executeProvider, type ProviderRunInput } from './Provider.ts'
import { type ProviderRegistry, providerRegistry } from './ProviderRegistry.ts'

export type { ProviderRunInput } from './Provider.ts'

type WarningLogger = Pick<Logger, 'warn'>

export class ProviderRunner {
    private readonly registry: ProviderRegistry
    private readonly warningLogger: WarningLogger

    public constructor(registry: ProviderRegistry = providerRegistry, warningLogger: WarningLogger = logger) {
        this.registry = registry
        this.warningLogger = warningLogger
    }

    public async run(providerPath: string, input: ProviderRunInput): Promise<DiscordPayload | null> {
        const definition = this.registry.get(providerPath)
        if (definition == null) {
            throw new Error(`Unknown provider ${providerPath}`)
        }

        const payload = await executeProvider(definition, input)
        if (payload != null) {
            const issues = validateDiscordPayload(payload)
            if (issues.length > 0) {
                this.warningLogger.warn(
                    JSON.stringify({
                        event: 'discord_payload_validation_warning',
                        provider: providerPath,
                        issues,
                    }),
                )
            }
        }
        return payload
    }

    public async runExample(providerPath: string): Promise<DiscordPayload | null> {
        return this.run(providerPath, loadProviderExample(providerPath, this.registry))
    }
}
