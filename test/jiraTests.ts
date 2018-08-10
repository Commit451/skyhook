import { Jira } from '../src/provider/Jira'
import { Tester } from './Tester'

describe('/POST jira', () => {
    it('deploy', async () => {
        Tester.test(new Jira(), 'jira.json', null)
    })
})
