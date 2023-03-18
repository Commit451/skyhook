import { expect } from 'chai'
import { CircleCi } from '../../src/provider/CircleCi.js'
import { Tester } from '../Tester.js'

describe('/POST circleci', () => {
    it('build', async () => {
        const res = await Tester.test(new CircleCi(), 'circleci.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
