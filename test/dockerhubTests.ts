import { DockerHub } from '../src/provider/DockerHub'
import { Tester } from './Tester'

describe('/POST dockerhub', () => {
    it('build', async () => {
        Tester.test(new DockerHub(), 'dockerhub.json', null)
    })
})
