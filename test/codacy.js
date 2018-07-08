process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index.ts');
const should = chai.should();

chai.use(chaiHttp);

const json = {
    "commit": {
        "data": {
            "uuid": "4cbf02df84dbcaa44b75a64ed832f7dbff2231dd",
            "urls": {
                "delta": "https://www.codacy.com/public/jquery/jquery.git/commit?bid=21776&cid=6037089"
            }
        },
        "results": {
            "fixed_count": 1,
            "new_count": 0
        }
    }
};

/*
 * Test the /POST route
 */
describe('/POST codacy', () => {
    it('commit', (done) => {
        chai.request(server)
            .post('/api/webhooks/test/test/codacy')
            .set("test", "true")
            .send(json)
            .end((err, res) => {
                res.should.have.status(200);
                console.log(res.body);
                should.exist(res.body)
                res.body.should.be.a('object');
                res.body.should.have.property('embeds');
                done();
            });
    });
});