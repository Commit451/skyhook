import { NewRelic } from '../src/provider/NewRelic'
import { Tester } from './Tester'

describe('/POST newrelic', () => {
    it('deploy', async () => {
        Tester.test(new NewRelic(), 'newrelic.json', null)
    })
})
