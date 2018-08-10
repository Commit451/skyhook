import { expect } from 'chai'
import { Pingdom } from '../src/provider/Pingdom'
import { Tester } from './Tester'

describe('/POST pingdom', () => {
    it('check', async () => {
        const res = await Tester.test(new Pingdom(), 'pingdom.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
