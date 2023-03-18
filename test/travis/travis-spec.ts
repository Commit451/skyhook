import { expect } from 'chai'
import { Travis } from '../../src/provider/Travis.js'
import { Tester } from '../Tester.js'

describe('/POST travis', () => {
    it('build', async () => {
        const res = await Tester.test(new Travis(), 'travis.json', {})
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
