import { expect } from 'chai'
import { Instana } from '../../src/provider/Instana.js'
import { Tester } from '../Tester.js'

describe('/POST instana', () => {

    it('general', async () => {
        const res = await Tester.test(new Instana(), 'instana.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('open incident', async () => {
        const res = await Tester.test(new Instana(), 'instana-open-incident.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('close incident', async () => {
        const res = await Tester.test(new Instana(), 'instana-close-incident.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('change event', async () => {
        const res = await Tester.test(new Instana(), 'instana-change-event.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
