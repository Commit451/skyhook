import { expect } from 'chai'
import { Codacy } from '../../src/provider/Codacy.js'
import { Tester } from '../Tester.js'

describe('/POST codacy', () => {
    it('commit', async () => {
        const res = await Tester.test(new Codacy(), 'codacy.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
