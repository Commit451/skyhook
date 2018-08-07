import { Codacy } from '../src/provider/Codacy'
import { Tester } from './Tester'

describe('/POST codacy', () => {
    it('commit', async () => {
        Tester.test(new Codacy(), 'codacy.json', null)
    })
})
