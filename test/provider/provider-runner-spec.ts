import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import type { DiscordPayload } from '../../src/model/DiscordApi.ts'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { DirectParseProvider } from '../../src/provider/BaseProvider.ts'
import { type ProviderDefinition, ProviderRegistry } from '../../src/provider/ProviderRegistry.ts'
import { ProviderRunner } from '../../src/provider/ProviderRunner.ts'

const delay = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })

class RunnerProvider extends DirectParseProvider {
    public static constructions = 0
    public static completions = 0
    private readonly instanceNumber = ++RunnerProvider.constructions

    public getName(): string {
        return 'Runner'
    }

    public getPath(): string {
        return 'runner'
    }

    public async parseData(): Promise<void> {
        await delay(5)
        RunnerProvider.completions += 1
        if (this.body.ignore === true) {
            this.nullifyPayload()
            return
        }
        this.payload.content = `instance-${this.instanceNumber}:${this.body.value ?? 'complete'}`
    }
}

class InvalidPayloadProvider extends DirectParseProvider {
    public getName(): string {
        return 'Invalid Payload'
    }

    public getPath(): string {
        return 'invalid'
    }

    public async parseData(): Promise<void> {
        this.payload.content = 'x'.repeat(2001)
    }
}

const runnerDefinition: ProviderDefinition = {
    path: 'runner',
    name: 'Runner',
    provider: RunnerProvider,
    example: { body: 'gitlab/gitlab.json' },
}

function createRunnerRegistry(): ProviderRegistry {
    const registry = new ProviderRegistry([runnerDefinition])
    // Registry construction validates metadata with a temporary provider. Request
    // construction counts start after that startup-only contract check.
    RunnerProvider.constructions = 0
    return registry
}

beforeEach(() => {
    RunnerProvider.constructions = 0
    RunnerProvider.completions = 0
})

describe('ProviderRunner', () => {
    it('awaits asynchronous provider parsing before returning', async () => {
        const runner = new ProviderRunner(createRunnerRegistry())

        const payload = await runner.run('runner', { body: { value: 'finished' } })

        assert.equal(RunnerProvider.completions, 1)
        assert.equal(payload?.content, 'instance-1:finished')
    })

    it('constructs a fresh provider for every execution', async () => {
        const runner = new ProviderRunner(createRunnerRegistry())

        const first = await runner.run('runner', { body: { value: 'first' } })
        const second = await runner.run('runner', { body: { value: 'second' } })

        assert.equal(first?.content, 'instance-1:first')
        assert.equal(second?.content, 'instance-2:second')
        assert.equal(RunnerProvider.constructions, 2)
    })

    it('preserves null for ignored or unsupported events', async () => {
        const runner = new ProviderRunner(createRunnerRegistry())

        const payload = await runner.run('runner', { body: { ignore: true } })

        assert.equal(payload, null)
    })

    it('uses the same execution path for live input and registered examples', async () => {
        const registry = createRunnerRegistry()
        const runner = new ProviderRunner(registry)
        const example = loadProviderExample('runner', registry)

        const livePayload = await runner.run('runner', example)
        const examplePayload = await runner.runExample('runner')

        assert.equal(livePayload?.content, 'instance-1:complete')
        assert.equal(examplePayload?.content, 'instance-2:complete')
    })

    it('reports validation issues as structured warnings without mutating or rejecting output', async () => {
        const definition: ProviderDefinition = {
            path: 'invalid',
            name: 'Invalid Payload',
            provider: InvalidPayloadProvider,
            example: { body: 'gitlab/gitlab.json' },
        }
        const warnings: unknown[] = []
        const runner = new ProviderRunner(new ProviderRegistry([definition]), {
            warn: (warning: unknown) => warnings.push(warning),
        })
        const expected: DiscordPayload = { content: 'x'.repeat(2001) }

        const payload = await runner.run('invalid', { body: {} })

        assert.deepEqual(payload, expected)
        assert.equal(warnings.length, 1)
        const warning = JSON.parse(String(warnings[0]))
        assert.equal(warning.event, 'discord_payload_validation_warning')
        assert.equal(warning.provider, 'invalid')
        assert.deepEqual(warning.issues, [{ code: 'content-length', path: 'content', actual: 2001, limit: 2000 }])
    })
})
