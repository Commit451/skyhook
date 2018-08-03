import { Trello } from '../src/providers/Trello'
import { Tester } from './Tester'

describe('/POST trello', () => {
    it('commentCard', async () => {
        Tester.test(new Trello(), 'trello.json', null)
    })
})
