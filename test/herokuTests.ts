import { Heroku } from '../src/providers/Heroku'
import { Tester } from './Tester'

describe('/POST heroku', () => {
    it('deploy', async () => {
        Tester.test(new Heroku(), 'heroku.json', null)
    })
})
