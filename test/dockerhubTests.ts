import { expect } from 'chai'
import { DockerHub } from '../src/provider/DockerHub'
import { Tester } from './Tester'

describe('/POST dockerhub', () => {
    it('build', async () => {
        const res = await Tester.test(new DockerHub(), 'dockerhub.json', null)
        expect(res).to.not.be.an('error')
        expect(res).to.not.be.a('DiscordPayload')
    })
})
