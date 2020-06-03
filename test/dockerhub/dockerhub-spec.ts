import { expect } from 'chai'
import { DockerHub } from '../../src/provider/DockerHub'
import { Tester } from '../Tester'

describe('/POST dockerhub', () => {
    it('build', async () => {
        const res = await Tester.test(new DockerHub(), 'dockerhub.json', null)
        expect(res.embeds).to.be.an('array').that.has.length(1)
    })
})
