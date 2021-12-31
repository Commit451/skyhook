import { expect } from 'chai'
import { Confluence } from '../../src/provider/Confluence'
import { Tester } from '../Tester'

describe('/POST confluence', () => {
    it('page_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_page.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('attachment_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_attachment.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('comment_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_comment.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('label_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_label.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('space_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_space.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('blog_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_blog.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
    it('user_', async () => {
        const res = await Tester.test(new Confluence(), 'confluence_user.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})