import { expect } from 'chai'
import { Basecamp } from '../../src/provider/Basecamp'
import { Tester } from '../Tester'

describe('/POST basecamp', () => {
    it('general', async () => {
        const res = await Tester.test(new Basecamp(), 'basecamp.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.is.not.empty
    })
})