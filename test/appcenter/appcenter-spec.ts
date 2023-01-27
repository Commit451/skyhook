import { expect } from 'chai'
import { AppCenter } from '../../src/provider/AppCenter'
import { Tester } from '../Tester'

describe('/POST appcenter', () => {
    it('push (event pipeline)', async () => {
        const res = await Tester.test(new AppCenter(), 'appcenter-pipeline.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })

    it('push (event distribute)', async () => {
        const res = await Tester.test(new AppCenter(), 'appcenter-distribute.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
