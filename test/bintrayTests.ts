import { Bintray } from '../src/provider/Bintray'
import { Tester } from './Tester'

/*
 * Test the /POST route
 */
describe('/POST bintray', () => {
    it('release', async () => {
        await Tester.test(new Bintray(), 'bintray.json', null)
    })
})
