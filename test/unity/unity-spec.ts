import { expect } from 'chai'
import { Unity } from '../../src/provider/Unity'
import { Tester } from '../Tester'

describe('/POST unity', () => {
    it('build', async () => {
        const res = await Tester.test(new Unity(), 'unity.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
