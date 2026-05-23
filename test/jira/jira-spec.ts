import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Jira } from '../../src/provider/Jira.ts'
import { Tester } from '../Tester.ts'

describe('/POST jira', () => {
    it('issue_updated', async () => {
        const res = await Tester.test(new Jira(), 'jira-issue.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('comment_added', async () => {
        const res = await Tester.test(new Jira(), 'jira-comment.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    it('custom_no_event', async () => {
        const res = await Tester.test(new Jira(), 'jira-custom-no-event.json', null)
        assert.ok(!(res instanceof Error))
        assert.strictEqual(res, null)
    })

    it('comment_only', async () => {
        const res = await Tester.test(new Jira(), 'jira-comment-only.json', null)
        assert.ok(!(res instanceof Error))
        assert.strictEqual(res, null)
    })

    it('browse_url', async () => {
        const provider: Jira = new Jira()
        const requestBody = JSON.parse(Tester.readTestFile(provider, 'jira-issue.json'))

        let res = await Tester.testWithBody(new Jira(), requestBody, null)
        assert.notStrictEqual(res, null)
        assert.strictEqual(res!.embeds![0]?.url, 'https://jira.atlassian.com/browse/JRA-20002')

        requestBody.issue.self = 'https://jira.atlassian.com/our/path/rest/api/2/issue/99291'
        res = await Tester.testWithBody(new Jira(), requestBody, null)
        assert.notStrictEqual(res, null)
        assert.strictEqual(res!.embeds![0]?.url, 'https://jira.atlassian.com/our/path/browse/JRA-20002')
    })
})
