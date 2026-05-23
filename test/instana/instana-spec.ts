import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Instana } from '../../src/provider/Instana.ts'
import { Tester } from '../Tester.ts'

describe('/POST instana', () => {
    it('general', async () => {
        const res = await Tester.test(new Instana(), 'instana.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('open incident', async () => {
        const res = await Tester.test(new Instana(), 'instana-open-incident.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('close incident', async () => {
        const res = await Tester.test(new Instana(), 'instana-close-incident.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('change event', async () => {
        const res = await Tester.test(new Instana(), 'instana-change-event.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
