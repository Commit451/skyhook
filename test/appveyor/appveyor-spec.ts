import { expect } from 'chai'
import { AppVeyor } from '../../src/provider/Appveyor'
import { Tester } from '../Tester'

describe('/POST appveyor', () => {
    it('build', async () => {
        const res = await Tester.test(new AppVeyor(), 'appveyor.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
