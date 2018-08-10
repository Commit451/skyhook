import { expect } from 'chai'
import { Jenkins } from '../src/provider/Jenkins'
import { Tester } from './Tester'

describe('/POST jenkins', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Jenkins(), 'jenkins.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
