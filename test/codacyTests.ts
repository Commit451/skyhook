import { Codacy } from '../src/providers/Codacy'
import { Tester } from './Tester'

describe('/POST codacy', () => {
    it('commit', async () => {
        Tester.test(new Codacy(), 'codacy.json', null)
    })
})
