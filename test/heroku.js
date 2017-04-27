process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

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
				res.body.should.have.property('content')
				done();
			});
	});
});
