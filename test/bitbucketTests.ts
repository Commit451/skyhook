import { BitBucket } from '../src/provider/Bitbucket'
import { Tester } from './Tester'

describe('/POST bitbucket', () => {
    it('repo:push', async () => {
        const headers = {
            'x-event-key': 'repo:push'
        }
        Tester.test(new BitBucket(), 'bitbucket.json', headers)
    })
})
