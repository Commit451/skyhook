import { expect } from 'chai'
import { Jira } from '../src/provider/Jira'
import { Tester } from './Tester'

describe('/POST jira', () => {
    it('issue_updated', async () => {
        const res = await Tester.test(new Jira(), 'jira.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
