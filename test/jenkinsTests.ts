import { Jenkins } from '../src/providers/Jenkins'
import { Tester } from './Tester'

const json = {
    name: 'Test',
    url: 'job/Test/',
    build: {
        full_url: 'http://jenkins-url/job/Test/25/',
        number: 25,
        queue_id: 25,
        phase: 'FINALIZED',
        status: 'SUCCESS',
        url: 'job/Test/25/',
        scm: {},
        log: '',
        artifacts: {}
    }
}

describe('/POST jenkins', () => {
    it('deploy', async () => {
        Tester.test(new Jenkins(), json, null)
    })
})
