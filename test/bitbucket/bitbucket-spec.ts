import { expect } from 'chai'
import { BitBucket } from '../../src/provider/Bitbucket.js'
import { Tester } from '../Tester.js'

describe('/POST bitbucket', () => {
    it('repo:push', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket.json', headers)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('repo:push tag', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket-tag.json', headers)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('repo:push anonymous-user', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        const res = await Tester.test(new BitBucket(), 'bitbucket-anonymous.json', headers)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
