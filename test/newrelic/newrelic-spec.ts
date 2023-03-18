import { expect } from 'chai'
import { NewRelic } from '../../src/provider/NewRelic.js'
import { Tester } from '../Tester.js'

describe('/POST newrelic', () => {
    it('deploy', async () => {
        const res = await Tester.test(new NewRelic(), 'newrelic.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
