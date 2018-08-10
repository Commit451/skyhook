import { expect } from 'chai'
import { NewRelic } from '../src/provider/NewRelic'
import { Tester } from './Tester'

describe('/POST newrelic', () => {
    it('deploy', async () => {
        const res = await Tester.test(new NewRelic(), 'newrelic.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
