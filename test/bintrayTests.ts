import { Bintray } from '../src/providers/Bintray'
import { Tester } from './Tester'

const json = {
    package: 'TestPackage',
    version: '1.2.1',
    released: '2017-08-02T20:52:51Z',
    release_notes: '**Release 1.2.1**\n* Fixed fatal crashes.\n* Internal optimizations.'
}

/*
 * Test the /POST route
 */
describe('/POST bintray', () => {
    it('release', async () => {
        Tester.test(new Bintray(), json, null)
    })
})
