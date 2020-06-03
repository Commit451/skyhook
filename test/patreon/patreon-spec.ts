import { expect } from 'chai'
import { Patreon } from '../../src/provider/Patreon'
import { Tester } from '../Tester'

describe('/POST patreon', () => {
    it('pledges:create (deprecated)', async () => {
        const headers = {
            'x-patreon-event': 'pledges:create'
        }
        const res = await Tester.test(new Patreon(), 'patreon-pledge-create.json', headers)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })

    it('members:update', async () => {
        const headers = {
            'x-patreon-event': 'members:create'
        }
        const res = await Tester.test(new Patreon(), 'patreon-member-create.json', headers)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
