import { expect } from 'chai'
import { CircleCi } from '../../src/provider/CircleCi'
import { Tester } from '../Tester'

describe('/POST circleci', () => {
    it('build', async () => {
        const res = await Tester.test(new CircleCi(), 'circleci.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
