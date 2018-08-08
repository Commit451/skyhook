import { UptimeRobot } from '../src/provider/UptimeRobot'
import { Tester } from './Tester'

describe('/POST uptimerobot', () => {
    it('monitor', async () => {
        const query: any = {
            monitorFriendlyName: 'Test Monitor',
            monitorURL: 'http://www.example.com',
            alertDetails: 'Connection timeout'
        }
        Tester.test(new UptimeRobot(), null, null, query)
    })
})
