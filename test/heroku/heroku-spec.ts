import { expect } from 'chai'
import { Heroku } from '../../src/provider/Heroku'
import { Tester } from '../Tester'

describe('/POST heroku', () => {
    it('deploy', async () => {
        const res = await Tester.test(new Heroku(), 'heroku.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
