import { expect } from 'chai'
import { BitBucketServer } from '../src/provider/BitBucketServer'
import { Tester } from './Tester'

describe('/POST bitbucketserver', () => {
    it('repo:refs_changed', async() => {
        const headers = {
            'x-event-key': 'repo:refs_changed'
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})