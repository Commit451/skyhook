import { expect } from 'chai'
import { Trello } from '../../src/provider/Trello'
import { Tester } from '../Tester'

describe('/POST trello', () => {
    it('commentCard', async () => {
        const res = await Tester.test(new Trello(), 'trello.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
