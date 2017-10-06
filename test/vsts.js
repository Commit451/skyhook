process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

const json = {
	"id": "03c164c2-8912-4d5e-8009-3707d5f83734",
	"eventType": "git.push",
	"publisherId": "tfs",
	"scope": "all",
	"message": {
		"text": "Jamal Hartnett pushed updates to branch master of repository Fabrikam-Fiber-Git.",
		"html": "Jamal Hartnett pushed updates to branch master of repository Fabrikam-Fiber-Git.",
		"markdown": "Jamal Hartnett pushed updates to branch `master` of repository `Fabrikam-Fiber-Git`."
	},
	"detailedMessage": {
		"text": "Jamal Hartnett pushed 1 commit to branch master of repository Fabrikam-Fiber-Git.\n - Fixed bug in web.config file 33b55f7c",
		"html": "Jamal Hartnett pushed 1 commit to branch <a href=\"https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/#version=GBmaster\">master</a> of repository <a href=\"https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/\">Fabrikam-Fiber-Git</a>.\n<ul>\n<li>Fixed bug in web.config file <a href=\"https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/commit/33b55f7cb7e7e245323987634f960cf4a6e6bc74\">33b55f7c</a>\n</ul>",
		"markdown": "Jamal Hartnett pushed 1 commit to branch [master](https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/#version=GBmaster) of repository [Fabrikam-Fiber-Git](https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/).\n* Fixed bug in web.config file [33b55f7c](https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/commit/33b55f7cb7e7e245323987634f960cf4a6e6bc74)"
	},
	"resource": {
		"commits": [
			{
				"commitId": "33b55f7cb7e7e245323987634f960cf4a6e6bc74",
				"author": {
					"name": "Jamal Hartnett",
					"email": "fabrikamfiber4@hotmail.com",
					"date": "2015-02-25T19:01:00Z"
				},
				"committer": {
					"name": "Jamal Hartnett",
					"email": "fabrikamfiber4@hotmail.com",
					"date": "2015-02-25T19:01:00Z"
				},
				"comment": "Fixed bug in web.config file",
				"url": "https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git/commit/33b55f7cb7e7e245323987634f960cf4a6e6bc74"
			}
		],
		"refUpdates": [
			{
				"name": "refs/heads/master",
				"oldObjectId": "aad331d8d3b131fa9ae03cf5e53965b51942618a",
				"newObjectId": "33b55f7cb7e7e245323987634f960cf4a6e6bc74"
			}
		],
		"repository": {
			"id": "278d5cd2-584d-4b63-824a-2ba458937249",
			"name": "Fabrikam-Fiber-Git",
			"url": "https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_apis/git/repositories/278d5cd2-584d-4b63-824a-2ba458937249",
			"project": {
				"id": "6ce954b1-ce1f-45d1-b94d-e6bf2464ba2c",
				"name": "Fabrikam-Fiber-Git",
				"url": "https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_apis/projects/6ce954b1-ce1f-45d1-b94d-e6bf2464ba2c",
				"state": "wellFormed"
			},
			"defaultBranch": "refs/heads/master",
			"remoteUrl": "https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_git/Fabrikam-Fiber-Git"
		},
		"pushedBy": {
			"id": "00067FFED5C7AF52@Live.com",
			"displayName": "Jamal Hartnett",
			"uniqueName": "Windows Live ID\\fabrikamfiber4@hotmail.com"
		},
		"pushId": 14,
		"date": "2014-05-02T19:17:13.3309587Z",
		"url": "https://fabrikam-fiber-inc.visualstudio.com/DefaultCollection/_apis/git/repositories/278d5cd2-584d-4b63-824a-2ba458937249/pushes/14"
	},
	"resourceVersion": "1.0",
		"resourceContainers": {
		"collection": {
			"id": "c12d0eb8-e382-443b-9f9c-c52cba5014c2"
		},
		"account": {
			"id": "f844ec47-a9db-4511-8281-8b63f4eaf94e"
		},
		"project": {
			"id": "be9b3917-87e6-42a4-a549-2bc06a7a878f"
		}
	},
	"createdDate": "2016-09-19T13:03:27.0379153Z"
}

/*
 *	Test the /POST route
 */
describe('/POST vsts', () => {
	it('git.push', (done) => {
		chai.request(server)
			.post('/api/webhooks/test/test/vsts')
			.set("eventType", "git.push")
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