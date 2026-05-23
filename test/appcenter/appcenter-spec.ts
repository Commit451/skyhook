import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppCenter } from '../../src/provider/AppCenter.ts'
import { Tester } from '../Tester.ts'

describe('/POST appcenter', () => {
    it('push (event pipeline)', async () => {
        const res = await Tester.test(new AppCenter(), 'appcenter-pipeline.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('push (event distribute)', async () => {
        const res = await Tester.test(new AppCenter(), 'appcenter-distribute.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
