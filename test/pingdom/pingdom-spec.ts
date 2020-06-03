import { expect } from 'chai'
import { Pingdom } from '../../src/provider/Pingdom'
import { Tester } from '../Tester'
import { DiscordPayload } from '../../src/model/DiscordPayload'

describe('/POST pingdom', () => {
    it('check', async () => {
        const res = await Tester.test(new Pingdom(), 'pingdom.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
