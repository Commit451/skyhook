import { expect } from 'chai'
import { UptimeRobot } from '../../src/provider/UptimeRobot.js'
import { Tester } from '../Tester.js'

describe('/POST uptimerobot', () => {
    it('monitor', async () => {
        const query = {
            monitorFriendlyName: 'Test Monitor',
            monitorURL: 'http://www.example.com',
            alertDetails: 'Connection timeout'
        }
        const res = await Tester.test(new UptimeRobot(), null, null, query)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
