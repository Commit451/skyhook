import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DockerHub } from '../../src/provider/DockerHub.ts'
import { Tester } from '../Tester.ts'

describe('/POST dockerhub', () => {
    it('build', async () => {
        const res = await Tester.test(new DockerHub(), 'dockerhub.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
