import { expect } from 'chai'
import { Jira } from '../../src/provider/Jira'
import { Tester } from '../Tester'

describe('/POST jira', () => {
    it('issue_updated', async () => {
        const res = await Tester.test(new Jira(), 'jira-issue.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })

    it('comment_added', async () => {
        const res = await Tester.test(new Jira(), 'jira-comment.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })

    it('custom_no_event', async () => {
        const res = await Tester.test(new Jira(), 'jira-custom-no-event.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.be.a('null')
    })

    it('comment_only', async () => {
        const res = await Tester.test(new Jira(), 'jira-comment-only.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.be.a('null')
    })

    it('browse_url', async () => {
        const provider: Jira = new Jira()
        const requestBody = JSON.parse(Tester.readTestFile(provider, 'jira-issue.json'))

        let res = await Tester.testWithBody(new Jira(), requestBody, null)
        expect(res.embeds[0].url).to.be.equal('https://jira.atlassian.com/browse/JRA-20002')

        requestBody.issue.self = 'https://jira.atlassian.com/our/path/rest/api/2/issue/99291'
        res = await Tester.testWithBody(new Jira(), requestBody, null)
        expect(res.embeds[0].url).to.be.equal('https://jira.atlassian.com/our/path/browse/JRA-20002')
    })
})
