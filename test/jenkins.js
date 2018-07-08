process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index.ts');
const should = chai.should();

chai.use(chaiHttp);

const json = {
    name: 'Test',
    url: 'job/Test/',
    build: {
        full_url: 'http://jenkins-url/job/Test/25/',
        number: 25,
        queue_id: 25,
        phase: 'FINALIZED',
        status: 'SUCCESS',
        url: 'job/Test/25/',
        scm: {},
        log: '',
        artifacts: {}
    }
};

/*
 * Test the /POST route
 */
describe('/POST jenkins', () => {
    it('deploy', (done) => {
        chai.request(server)
            .post('/api/webhooks/test/test/jenkins')
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
