import { expect } from 'chai'
import { BitBucketServer } from '../../src/provider/BitBucketServer'
import { Tester } from '../Tester'

describe('/POST bitbucketserver', () => {
    it('repo:refs_changed', async() => {
        const headers = {
            'x-event-key': 'repo:refs_changed'
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })

    it('repo:refs_changed 18 fields or less', async() => {
        const headers = {
            'x-event-key': 'repo:refs_changed'
        }

        const res = await Tester.test(new BitBucketServer(), 'bitbucketserver.json', headers)
        expect(res.embeds[0].fields.length).to.not.be.greaterThan(18)
    })
})