import { assert } from 'chai'
import { Bintray } from '../src/providers/Bintray'

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
        const bintray = new Bintray()
        const res = await bintray.parse(json, null)
        console.log(res)
        assert(res !== null)
    })
})
