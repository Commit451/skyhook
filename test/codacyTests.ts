import { expect } from 'chai'
import { Codacy } from '../src/provider/Codacy'
import { Tester } from './Tester'

describe('/POST codacy', () => {
    it('commit', async () => {
        const res = await Tester.test(new Codacy(), 'codacy.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
