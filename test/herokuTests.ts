import { Heroku } from '../src/providers/Heroku'
import { Tester } from './Tester'

const json = {
    app: 'test',
    user: 'example@example.com',
    url: 'https://www.example.com'
}

describe('/POST heroku', () => {
    it('deploy', async () => {
        Tester.test(new Heroku(), json, null)
    })
})
