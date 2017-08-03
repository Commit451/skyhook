process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

const json = {
    "package": "TestPackage",
    "version": "1.2.1",
    "released": "2017-08-02T20:52:51Z",
    "release_notes": "**Release 1.2.1**\n* Fixed fatal crashes.\n* Internal optimizations."
};

/*
 * Test the /POST route
 */
describe('/POST bintray', () => {
    it('release', (done) => {
        chai.request(server)
            .post('/api/webhooks/test/test/bintray')
            .set("test", "true")
            .send(json)
            .end((err, res) => {
                res.should.have.status(200);
                console.log(res.body);
                res.body.should.be.a('object');
                res.body.should.have.property('embeds');
                done();
            });
    });
});
