import { VSTS } from '../src/providers/VSTS'
import { Tester } from './Tester'

describe('/POST vsts', () => {
    it('git.push', async () => {
        Tester.test(new VSTS(), 'vsts.json', null)
    })
})
