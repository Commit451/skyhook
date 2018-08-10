import { expect } from 'chai'
import { AppVeyor } from '../src/provider/Appveyor'
import { Tester } from './Tester'

describe('/POST appveyor', () => {
    it('build', async () => {
        const res = await Tester.test(new AppVeyor(), 'appveyor.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
