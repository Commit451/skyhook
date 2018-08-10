import { expect } from 'chai'
import { BitBucket } from '../src/provider/Bitbucket'
import { Tester } from './Tester'

describe('/POST bitbucket', () => {
    it('repo:push', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        const res = Tester.test(new BitBucket(), 'bitbucket.json', headers)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
