import { GitLab } from '../src/providers/GitLab'
import { Tester } from './Tester'

describe('/POST gitlab', () => {
    it('push', async () => {
        Tester.test(new GitLab(), 'gitlab.json', null)
    })
})
