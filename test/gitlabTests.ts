import { GitLab } from '../src/provider/GitLab'
import { Tester } from './Tester'

describe('/POST gitlab', () => {
    it('push', async () => {
        Tester.test(new GitLab(), 'gitlab.json', null)
    })
})
