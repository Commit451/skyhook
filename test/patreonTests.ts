import { expect } from 'chai'
import { Patreon } from '../src/provider/Patreon'
import { Tester } from './Tester'

describe('/POST patreon', () => {
    it('pledges:update', async () => {
        const headers = {
            'x-patreon-event': 'pledges:update'
        }
        const res = await Tester.test(new Patreon(), 'patreon.json', headers)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
