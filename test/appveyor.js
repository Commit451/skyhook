process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

var json = {
   "eventName":"build_success",
   "eventData":{
      "passed":true,
      "failed":false,
      "status":"Success",
      "started":"2014-04-14 7:57 PM",
      "finished":"2014-04-14 7:58 PM",
      "duration":"00:01:30.3741236",
      "projectId":12064,
      "projectName":"test-web",
      "buildId":14636,
      "buildNumber":26,
      "buildVersion":"1.0.26",
      "repositoryProvider":"gitHub",
      "repositoryScm":"git",
      "repositoryName":"JohnSmith/test-web",
      "branch":"master",
      "commitId":"ad2366f0c4",
      "commitAuthor":"John Smith",
      "commitAuthorEmail":"john@smith.com",
      "commitDate":"2014-04-14 1:54 AM",
      "commitMessage":"Some changes to appveyor.yml",
      "committerName":"John Smith",
      "committerEmail":"john@smith.com",
      "isPullRequest":true,
      "pullRequestId":1,
      "buildUrl":"https://ci.appveyor.com/project/JohnSmith/test-web/build/1.0.26",
      "notificationSettingsUrl":"https://ci.appveyor.com/notifications",
      "messages":[],
      "jobs":[
         {
            "id":"es941edratul5jm3",
            "name":"",
            "passed":true,
            "failed":false,
            "status":"Success",
            "started":"2014-04-14 7:57 PM",
            "finished":"2014-04-14 7:58 PM",
            "duration":"00:01:27.9060155",
            "messages":[

            ],
            "compilationMessages":[
               {
                  "category":"warning",
                  "message":"Found conflicts between different versions of the same dependent assembly....",
                  "details":"MSB3247",
                  "fileName":"..\\..\\Program%20Files%20(x86)\\MSBuild\\12.0\\bin\\Microsoft.Common.CurrentVersion.targets",
                  "line":1635,
                  "column":5,
                  "projectName":"MyWebApp",
                  "projectFileName":"MyWebApp\\MyWebApp.csproj",
                  "created":"2014-04-14T19:57:54.0838622+00:00"
               }
            ],
            "artifacts":[
               {
                  "fileName":"MyWebApp.zip",
                  "name":"MyWebApp",
                  "type":"WebDeployPackage",
                  "size":3491576,
                  "url":"https://ci.appveyor.com/api/buildjobs/es941edratul5jm3/artifacts/token/261761baaaa8337f0a13fa8b5587451ff2d13e4cff095c74e6eabb5d5dea0909/MyWebApp.zip"
               }
            ]
         }
      ]
   }
}

  /*
  * Test the /POST route
  */
  describe('/POST appveyor', () => {
        it('build', (done) => {
          chai.request(server)
              .post('/api/webhooks/test/test/appveyor')
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
