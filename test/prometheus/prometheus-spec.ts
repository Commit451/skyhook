import { expect } from 'chai'
import { Tester } from '../Tester'
import { Prometheus } from '../../src/provider/Prometheus'

describe('/POST prometheus', () => {
    it('fires when called', async () => {
        const res = await Tester.test(new Prometheus(), 'prometheus.json')
        expect(res).to.not.be.null
    })
})