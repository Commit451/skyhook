process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

var repoPushJson = {
	"actor": "Owner",
	"repository": "Repository",
	"push": {
		"changes": [
			{
				"new": {
					"type": "branch",
					"name": "name-of-branch",
					"target": {
						"type": "commit",
						"hash": "709d658dc5b6d6afcd46049c2f332ee3f515a67d",
						"author": "User",
						"message": "new commit message\n",
						"date": "2015-06-09T03:34:49+00:00",
						"parents": [
							{
								"type": "commit",
								"hash": "1e65c05c1d5171631d92438a13901ca7dae9618c",
								"links": {
									"self": {
										"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commit/8cbbd65829c7ad834a97841e0defc965718036a0"
									},
									"html": {
										"href": "https://bitbucket.org/user_name/repo_name/commits/8cbbd65829c7ad834a97841e0defc965718036a0"
									}
								}
							}
						],
						"links": {
							"self": {
								"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commit/c4b2b7914156a878aa7c9da452a09fb50c2091f2"
							},
							"html": {
								"href": "https://bitbucket.org/user_name/repo_name/commits/c4b2b7914156a878aa7c9da452a09fb50c2091f2"
							}
						}
					},
					"links": {
						"self": {
							"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/refs/branches/master"
						},
						"commits": {
							"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commits/master"
						},
						"html": {
							"href": "https://bitbucket.org/user_name/repo_name/branch/master"
						}
					}
				},
				"old": {
					"type": "branch",
					"name": "name-of-branch",
					"target": {
						"type": "commit",
						"hash": "1e65c05c1d5171631d92438a13901ca7dae9618c",
						"author": "User",
						"message": "old commit message\n",
						"date": "2015-06-08T21:34:56+00:00",
						"parents": [
							{
								"type": "commit",
								"hash": "e0d0c2041e09746be5ce4b55067d5a8e3098c843",
								"links": {
									"self": {
										"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commit/9c4a3452da3bc4f37af5a6bb9c784246f44406f7"
									},
									"html": {
										"href": "https://bitbucket.org/user_name/repo_name/commits/9c4a3452da3bc4f37af5a6bb9c784246f44406f7"
									}
								}
							}
						],
						"links": {
							"self": {
								"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commit/b99ea6dad8f416e57c5ca78c1ccef590600d841b"
							},
							"html": {
								"href": "https://bitbucket.org/user_name/repo_name/commits/b99ea6dad8f416e57c5ca78c1ccef590600d841b"
							}
						}
					},
					"links": {
						"self": {
							"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/refs/branches/master"
						},
						"commits": {
							"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commits/master"
						},
						"html": {
							"href": "https://bitbucket.org/user_name/repo_name/branch/master"
						}
					}
				},
				"links": {
					"html": {
						"href": "https://bitbucket.org/user_name/repo_name/branches/compare/c4b2b7914156a878aa7c9da452a09fb50c2091f2..b99ea6dad8f416e57c5ca78c1ccef590600d841b"
					},
					"diff": {
						"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/diff/c4b2b7914156a878aa7c9da452a09fb50c2091f2..b99ea6dad8f416e57c5ca78c1ccef590600d841b"
					},
					"commits": {
						"href": "https://api.bitbucket.org/2.0/repositories/user_name/repo_name/commits?include=c4b2b7914156a878aa7c9da452a09fb50c2091f2&exclude=b99ea6dad8f416e57c5ca78c1ccef590600d841b"
					}
				},
				"created": false,
				"forced": false,
				"closed": false,
				"commits": [
					{
						"hash": "03f4a7270240708834de475bcf21532d6134777e",
						"type": "commit",
						"message": "commit message\n",
						"author": "User",
						"links": {
							"self": {
								"href": "https://api.bitbucket.org/2.0/repositories/user/repo/commit/03f4a7270240708834de475bcf21532d6134777e"
							},
							"html": {
								"href": "https://bitbucket.org/user/repo/commits/03f4a7270240708834de475bcf21532d6134777e"
							}
						}
					}
				],
				"truncated": false
			}
		]
	}
}

/*
* Test the /POST route
*/
describe('/POST bitbucket', () => {
	it('repo:push', (done) => {
		chai.request(server)
			.post('/api/webhooks/test/test/bitbucket')
			//.set("X-Event-Key", "repo:push")
			.send(repoPushJson)
			.end((err, res) => {
				res.should.have.status(200);
				console.log(res.body);
				res.body.should.be.a('object');
				res.body.should.have.property('embeds')
				done();
			});
	});
});
