import { Unity } from '../src/providers/Unity'
import { Tester } from './Tester'

describe('/POST unity', () => {
    it('build', async () => {
        Tester.test(new Unity(), 'unity.json', null)
    })
})
