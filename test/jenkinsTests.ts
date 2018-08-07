import { Jenkins } from '../src/provider/Jenkins'
import { Tester } from './Tester'

describe('/POST jenkins', () => {
    it('deploy', async () => {
        Tester.test(new Jenkins(), 'jenkins.json', null)
    })
})
