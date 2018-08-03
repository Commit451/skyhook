import { AppVeyor } from '../src/providers/Appveyor'
import { Tester } from './Tester'

describe('/POST appveyor', () => {
    it('build', async () => {
        await Tester.test(new AppVeyor(), 'appveyor.json', null)
    })
})
