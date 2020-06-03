import { expect } from 'chai'
import { UptimeRobot } from '../../src/provider/UptimeRobot'
import { Tester } from '../Tester'

describe('/POST uptimerobot', () => {
    it('monitor', async () => {
        const query: any = {
            monitorFriendlyName: 'Test Monitor',
            monitorURL: 'http://www.example.com',
            alertDetails: 'Connection timeout'
        }
        const res = await Tester.test(new UptimeRobot(), null, null, query)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
