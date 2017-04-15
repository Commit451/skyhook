// server.js

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var gitlab = require('./providers/gitlab');
var travis = require('./providers/travis');
var circleci = require('./providers/circleci');
var appveyor = require('./providers/appveyor');
var unity = require('./providers/unity');
var app = express();

app.use(bodyParser.json());
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post("/api/webhooks/:hookPart1/:hookPart2/:from", function (req, res) {

    var hookPart1 = req.params.hookPart1;
    var hookPart2 = req.params.hookPart2;
    var from = req.params.from;
    if (!hookPart1 || !hookPart2 || !from) {
      res.sendStatus(400);
      return;
    }
    var discordHookUrl = "https://discordapp.com/api/webhooks/" + hookPart1 + "/" + hookPart2;

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    var discordPayload = {
    };
    switch (from) {
        case "gitlab":
            gitlab.parse(req, discordPayload);
            break;
        case "travis":
            travis.parse(req, discordPayload);
            break;
        case "circleci":
            circleci.parse(req, discordPayload);
            break;
        case "appveyor":
            appveyor.parse(req, discordPayload);
            break;
        case "unity":
            unity.parse(req, discordPayload);
            break;
        default:
            console.log("Unknown from: " + from);
            break;
        //todo return some error
    }

    var jsonString = JSON.stringify(discordPayload);
    //special case for testing. Kinda lame to do that, but meh
    if (hookPart1 == "test") {
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonString);
      return;
    }
    request.post({
        headers: {'content-type': 'application/json'},
        url: discordHookUrl,
        body: jsonString
    }, function (error, response, body) {
        if (error) {
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    });
});

// listen for requests :)
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

//for the tests!
module.exports = server
