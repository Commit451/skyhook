import { expect } from 'chai'
import { Jenkins } from '../../src/provider/Jenkins'
import { Tester } from '../Tester'

describe('/POST jenkins', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Jenkins(), 'jenkins.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
