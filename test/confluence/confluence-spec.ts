import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Confluence } from '../../src/provider/Confluence.ts'
import { Tester } from '../Tester.ts'

describe('/POST confluence', () => {
    it('page_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_page.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('attachment_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_attachment.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('comment_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_comment.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('label_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_label.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('space_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_space.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('blog_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_blog.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
    it('user_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_user.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })
})
