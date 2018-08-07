import { Unity } from '../src/provider/Unity'
import { Tester } from './Tester'

describe('/POST unity', () => {
    it('build', async () => {
        Tester.test(new Unity(), 'unity.json', null)
    })
})
