import { expect } from 'chai'
import { Unity } from '../../src/provider/Unity.js'
import { Tester } from '../Tester.js'

describe('/POST unity', () => {
    it('build', async () => {
        const res = await Tester.test(new Unity(), 'unity.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
