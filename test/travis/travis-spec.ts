import { expect } from 'chai'
import { Travis } from '../../src/provider/Travis'
import { Tester } from '../Tester'

describe('/POST travis', () => {
    it('build', async () => {
        const res = await Tester.test(new Travis(), 'travis.json', {})
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
