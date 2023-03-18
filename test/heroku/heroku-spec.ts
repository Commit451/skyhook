import { expect } from 'chai'
import { Heroku } from '../../src/provider/Heroku.js'
import { Tester } from '../Tester.js'

describe('/POST heroku', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Heroku(), 'heroku.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
