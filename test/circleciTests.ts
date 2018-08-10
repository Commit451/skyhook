import { expect } from 'chai'
import { CircleCi } from '../src/provider/CircleCi'
import { Tester } from './Tester'

describe('/POST circleci', () => {
    it('build', async () => {
        const res = await Tester.test(new CircleCi(), 'circleci.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
