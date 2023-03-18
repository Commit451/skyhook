import { expect } from 'chai'
import { VSTS } from '../../src/provider/VSTS.js'
import { Tester } from '../Tester.js'

describe('/POST vsts', () => {
    it('git.push', async () => {
        const res = await Tester.test(new VSTS(), 'vsts.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
