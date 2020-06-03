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


})
