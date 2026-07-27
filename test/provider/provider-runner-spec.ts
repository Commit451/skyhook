import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { defineProvider, type ProviderOutput } from '../../src/provider/Provider.ts'
import { ProviderRegistry } from '../../src/provider/ProviderRegistry.ts'
import { ProviderRunner } from '../../src/provider/ProviderRunner.ts'

const delay = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })

let completions = 0
const outputs = new Set<ProviderOutput>()

const runnerDefinition = defineProvider({
    path: 'runner',
    name: 'Runner',
    example: { body: 'gitlab/gitlab.json' },
    async map({ body }, output) {
        outputs.add(output)
        await delay(5)
        completions += 1
        if (body.ignore === true) {
            output.ignore()
            return
        }
        output.payload.content = String(body.value ?? 'complete')
    },
})

function createRunnerRegistry(): ProviderRegistry {
    return new ProviderRegistry([runnerDefinition])
}

beforeEach(() => {
    completions = 0
    outputs.clear()
})

describe('ProviderRunner', () => {
    it('awaits asynchronous provider mapping before returning', async () => {
        const runner = new ProviderRunner(createRunnerRegistry())

        const payload = await runner.run('runner', { body: { value: 'finished' } })

        assert.equal(completions, 1)
        assert.equal(payload?.content, 'finished')
    })

    it('uses fresh output state for every execution', async () => {
        const runner = new ProviderRunner(createRunnerRegistry())

        const first = await runner.run('runner', { body: { value: 'first' } })
        const second = await runner.run('runner', { body: { value: 'second' } })

        assert.equal(first?.content, 'first')
        assert.equal(second?.content, 'second')
        assert.equal(outputs.size, 2)
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

        assert.equal(livePayload?.content, 'complete')
        assert.equal(examplePayload?.content, 'complete')
    })

    it('returns a centrally finalized Discord payload', async () => {
        const definition = defineProvider({
            path: 'oversized',
            name: 'Oversized',
            example: { body: 'gitlab/gitlab.json' },
            map(_request, output) {
                output.payload.content = 'x'.repeat(2_001)
            },
        })
        const warnings: unknown[] = []
        const runner = new ProviderRunner(new ProviderRegistry([definition]), {
            warn: (warning: unknown) => warnings.push(warning),
        })

        const payload = await runner.run('oversized', { body: {} })

        assert.equal(payload?.content?.length, 2_000)
        assert.deepEqual(payload?.allowed_mentions, { parse: [] })
        assert.deepEqual(warnings, [])
    })
})
