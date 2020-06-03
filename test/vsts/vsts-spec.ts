import { expect } from 'chai'
import { VSTS } from '../../src/provider/VSTS'
import { Tester } from '../Tester'

describe('/POST vsts', () => {
    it('git.push', async () => {
        const res = await Tester.test(new VSTS(), 'vsts.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
