import { expect } from 'chai'
import { Rollbar } from '../../src/provider/Rollbar.js'
import { Tester } from '../Tester.js'

describe('/POST rollbar', () => {
    it('new item', async () => {
        const res = await Tester.test(new Rollbar(), 'rollbar.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
