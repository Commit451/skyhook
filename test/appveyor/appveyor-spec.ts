import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppVeyor } from '../../src/provider/Appveyor.ts'
import { Tester } from '../Tester.ts'

describe('/POST appveyor', () => {
    it('build', async () => {
        const res = await Tester.test(new AppVeyor(), 'appveyor.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
