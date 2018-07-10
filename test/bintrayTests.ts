process.env.NODE_ENV = 'test'

import * as chai from 'chai'
import chaiHttp = require('chai-http')

const server = require('../src/index.ts')
const should = chai.should()

chai.use(chaiHttp)

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
    it('release', (done) => {
        chai.request(server)
            .post('/api/webhooks/test/test/bintray')
            .send(json)
            .end((err, res) => {
                res.should.have.status(200)
                console.log(res.body)
                should.exist(res.body)
                res.body.should.be.a('object')
                res.body.should.have.property('embeds')
                done()
            })
    })
})
