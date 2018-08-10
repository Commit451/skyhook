import { expect } from 'chai'
import { Bintray } from '../src/provider/Bintray'
import { Tester } from './Tester'

/*
 * Test the /POST route
 */
describe('/POST bintray', () => {
    it('release', async () => {
        const res = await Tester.test(new Bintray(), 'bintray.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
