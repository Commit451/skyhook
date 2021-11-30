import { expect } from 'chai'
import { AzureDevops } from '../../src/provider/AzureDevops'
import { Tester } from '../Tester'

describe('/POST azure-devops', () => {
    it('should build', async () => {
        const res = await Tester.test(new AzureDevops(), 'azure-devops.json', null)
        expect(res).to.not.be.null
        expect(res!.embeds).to.be.an('array').that.has.length(1)
    })
})