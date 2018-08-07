import { Travis } from '../src/provider/Travis'
import { Tester } from './Tester'

describe('/POST travis', () => {
    it('build', async () => {
        Tester.test(new Travis(), 'travis.json', null)
    })
})
