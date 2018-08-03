import { Travis } from '../src/providers/Travis'
import { Tester } from './Tester'

describe('/POST travis', () => {
    it('build', async () => {
        Tester.test(new Travis(), 'travis.json', null)
    })
})
