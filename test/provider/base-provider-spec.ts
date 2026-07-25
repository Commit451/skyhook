import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DirectParseProvider } from '../../src/provider/BaseProvider.ts'
import { Rollbar } from '../../src/provider/Rollbar.ts'

const delay = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })

class DelayedProvider extends DirectParseProvider {
    public completed = false

    public getName(): string {
        return 'Delayed'
    }

    public async parseData(): Promise<void> {
        await delay(10)
        this.completed = true
        this.payload.content = 'complete'
    }
}

class LifecycleProvider extends DirectParseProvider {
    public readonly lifecycle: string[] = []

    public getName(): string {
        return 'Lifecycle'
    }

    protected async preParse(): Promise<void> {
        await delay(5)
        this.lifecycle.push('preParse')
    }

    public async parseData(): Promise<void> {
        this.lifecycle.push('parseData')
    }

    protected async postParse(): Promise<void> {
        await delay(5)
        this.lifecycle.push('postParse')
    }
}

class NullifyingProvider extends DirectParseProvider {
    public postParseCalled = false

    public getName(): string {
        return 'Nullifying'
    }

    public async parseData(): Promise<void> {
        this.nullifyPayload()
    }

    protected postParse(): void {
        this.postParseCalled = true
    }

    public addEmbedAfterCancellation(): number {
        this.addEmbed({ title: 'must not be added' })
        return this.payload.embeds?.length ?? 0
    }
}

describe('BaseProvider parsing lifecycle', () => {
    it('waits for delayed direct parsing before resolving', async () => {
        const provider = new DelayedProvider()

        const result = await provider.parse(null)

        assert.strictEqual(provider.completed, true)
        assert.strictEqual(result?.content, 'complete')
    })

    it('awaits preParse, parseData, and postParse in lifecycle order', async () => {
        const provider = new LifecycleProvider()

        await provider.parse(null)

        assert.deepStrictEqual(provider.lifecycle, ['preParse', 'parseData', 'postParse'])
    })

    it('returns null, skips postParse, and prevents embeds after nullification', async () => {
        const provider = new NullifyingProvider()

        const result = await provider.parse(null)

        assert.strictEqual(result, null)
        assert.doesNotThrow(() => {
            assert.strictEqual(provider.addEmbedAfterCancellation(), 0)
        })
        assert.strictEqual(provider.postParseCalled, false)
    })

    it('returns null without throwing for an unknown Rollbar event', async () => {
        const result = await new Rollbar().parse({ event_name: 'unknown_event' })

        assert.strictEqual(result, null)
    })
})
