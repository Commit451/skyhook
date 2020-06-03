import { expect } from 'chai'
import { GitLab } from '../../src/provider/GitLab'
import { Tester } from '../Tester'

describe('/POST gitlab', () => {
    it('push', async () => {
        const res = await Tester.test(new GitLab(), 'gitlab.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
