import { Patreon } from '../src/providers/Patreon'
import { Tester } from './Tester'

describe('/POST patreon', () => {
    it('pledges:update', async () => {
        const headers = {
            'x-patreon-event': 'pledges:update'
        }
        Tester.test(new Patreon(), 'patreon.json', headers)
    })
})
