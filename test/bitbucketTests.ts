import { BitBucket } from '../src/providers/Bitbucket'
import { Tester } from './Tester'

describe('/POST bitbucket', () => {
    it('repo:push', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        Tester.test(new BitBucket(), 'bitbucket.json', headers)
    })
})
