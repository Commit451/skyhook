import { CircleCi } from '../src/provider/CircleCi'
import { Tester } from './Tester'

describe('/POST circleci', () => {
    it('build', async () => {
        Tester.test(new CircleCi(), 'circleci.json', null)
    })
})
