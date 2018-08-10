import { expect } from 'chai'
import { VSTS } from '../src/provider/VSTS'
import { Tester } from './Tester'

describe('/POST vsts', () => {
    it('git.push', async () => {
        const res = await Tester.test(new VSTS(), 'vsts.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
