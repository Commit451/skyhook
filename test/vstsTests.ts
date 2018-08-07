import { VSTS } from '../src/provider/VSTS'
import { Tester } from './Tester'

describe('/POST vsts', () => {
    it('git.push', async () => {
        Tester.test(new VSTS(), 'vsts.json', null)
    })
})
