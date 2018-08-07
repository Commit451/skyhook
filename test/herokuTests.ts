import { Heroku } from '../src/provider/Heroku'
import { Tester } from './Tester'

describe('/POST heroku', () => {
    it('deploy', async () => {
        Tester.test(new Heroku(), 'heroku.json', null)
    })
})
