process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

/*
* Test the /POST route
*/
describe('/POST heroku', () => {
	it('deploy', (done) => {
		chai.request(server)
			.post('/api/webhooks/test/test/heroku')
			.set("test", "true")
			.send({app: 'test', user: 'example@example.com', url: 'https://www.example.com'})
			.end((err, res) => {
				res.should.have.status(200);
				console.log(res.body);
				res.body.should.be.a('object');
				res.body.should.have.property('embeds');
				done();
			});
	});
});
