process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

var json = {
  "id": 1,
  "number": "1",
  "status": null,
  "started_at": null,
  "finished_at": null,
  "status_message": "Passed",
  "commit": "62aae5f70ceee39123ef",
  "branch": "master",
  "message": "the commit message",
  "compare_url": "https://github.com/svenfuchs/minimal/compare/master...develop",
  "committed_at": "2011-11-11T11: 11: 11Z",
  "committer_name": "Sven Fuchs",
  "committer_email": "svenfuchs@artweb-design.de",
  "author_name": "Sven Fuchs",
  "author_email": "svenfuchs@artweb-design.de",
  "type": "push",
  "build_url": "https://travis-ci.org/svenfuchs/minimal/builds/1",
  "repository": {
    "id": 1,
    "name": "minimal",
    "owner_name": "svenfuchs",
    "url": "http://github.com/svenfuchs/minimal"
  },
  "config": {
    "notifications": {
      "webhooks": ["http://evome.fr/notifications", "http://example.com/"]
    }
  },
  "matrix": [
    {
      "id": 2,
      "repository_id": 1,
      "number": "1.1",
      "state": "created",
      "started_at": null,
      "finished_at": null,
      "config": {
        "notifications": {
          "webhooks": ["http://evome.fr/notifications", "http://example.com/"]
        }
      },
      "status": null,
      "log": "",
      "result": null,
      "parent_id": 1,
      "commit": "62aae5f70ceee39123ef",
      "branch": "master",
      "message": "the commit message",
      "committed_at": "2011-11-11T11: 11: 11Z",
      "committer_name": "Sven Fuchs",
      "committer_email": "svenfuchs@artweb-design.de",
      "author_name": "Sven Fuchs",
      "author_email": "svenfuchs@artweb-design.de",
      "compare_url": "https://github.com/svenfuchs/minimal/compare/master...develop"
    }
  ]
}

/*
* Test the /POST route
*/
describe('/POST travis', () => {
  it('build', (done) => {
    chai.request(server)
      .post('/api/webhooks/test/test/travis')
      .set("test", "true")
      .send(json)
      .end((err, res) => {
        res.should.have.status(200);
        console.log(res.body);
        res.body.should.be.a('object');
        res.body.should.have.property('content')
        done();
      });
  });
});
