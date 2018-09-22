import { expect } from 'chai'
import { Travis } from '../src/provider/Travis'
import { Tester } from './Tester'

describe('/POST travis', () => {
    it('build', async () => {
        const res = await Tester.test(new Travis(), 'travis.json', {})
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
