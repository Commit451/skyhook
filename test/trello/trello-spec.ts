import { expect } from 'chai'
import { Trello } from '../../src/provider/Trello.js'
import { Tester } from '../Tester.js'

describe('/POST trello', () => {
    it('commentCard', async () => {
        const res = await Tester.test(new Trello(), 'trello.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})
