import { expect } from 'chai'
import { Pingdom } from '../../src/provider/Pingdom.js'
import { Tester } from '../Tester.js'

describe('/POST pingdom', () => {
    it('check', async () => {
        const res = await Tester.test(new Pingdom(), 'pingdom.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
