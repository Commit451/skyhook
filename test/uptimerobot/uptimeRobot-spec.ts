import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { UptimeRobot } from '../../src/provider/UptimeRobot.ts'
import { Tester } from '../Tester.ts'

describe('/POST uptimerobot', () => {
    it('monitor', async () => {
        const query = {
            monitorFriendlyName: 'Test Monitor',
            monitorURL: 'http://www.example.com',
            alertDetails: 'Connection timeout',
        }
        const res = await Tester.test(new UptimeRobot(), null, null, query)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
