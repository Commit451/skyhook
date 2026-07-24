import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { UptimeRobot } from '../../src/provider/UptimeRobot.ts'
import { Tester } from '../Tester.ts'

describe('/POST uptimerobot', () => {
    it('monitor', async () => {
        const res = await Tester.test(new UptimeRobot(), 'uptimerobot.json', null, {})
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
