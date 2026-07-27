import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { providerRegistry } from '../../src/provider/ProviderRegistry.ts'
import { ProviderRunner } from '../../src/provider/ProviderRunner.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'

const runner = new ProviderRunner(providerRegistry)

describe('provider contracts', () => {
    for (const definition of providerRegistry.definitions) {
        it(`${definition.path} has valid metadata and produces a valid packaged example`, async () => {
            assert.match(definition.path, /^[a-z][a-z0-9-]*$/)
            assert.notEqual(definition.name.trim(), '')
            assert.notEqual(definition.example.body.trim(), '')
            assert.equal(Object.isFrozen(definition), true)
            assert.equal(Object.isFrozen(definition.example), true)

            const payload = await runner.runExample(definition.path)
            assert.ok(payload, `${definition.path} ignored its packaged example`)
            assert.ok(
                (typeof payload.content === 'string' && payload.content.length > 0) ||
                    (Array.isArray(payload.embeds) && payload.embeds.length > 0),
                `${definition.path} produced an empty packaged example`,
            )
            assert.deepEqual(payload.allowed_mentions, { parse: [] })
            assert.deepEqual(validateDiscordPayload(payload), [])
        })
    }
})
