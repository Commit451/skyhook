// server.js
require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var appveyor = require('./providers/appveyor');
var bitbucket = require('./providers/bitbucket');
var circleci = require('./providers/circleci');
var gitlab = require('./providers/gitlab');
var heroku = require('./providers/heroku');
var travis = require('./providers/travis');
var unity = require('./providers/unity');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post("/api/webhooks/:hookPart1/:hookPart2/:from", function (req, res) {

    var hookPart1 = req.params.hookPart1;
    var hookPart2 = req.params.hookPart2;
    var provider = req.params.from;
    var test = req.get("test")
    if (!hookPart1 || !hookPart2 || !provider) {
        res.sendStatus(400);
        return;
    }
    var discordHookUrl = "https://discordapp.com/api/webhooks/" + hookPart1 + "/" + hookPart2;

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    var discordPayload = {
    };
    var error = false;
    switch (provider) {
        case "appveyor":
            appveyor.parse(req, discordPayload);
            break;
        case "bitbucket":
            bitbucket.parse(req, discordPayload);
            break;
        case "circleci":
            circleci.parse(req, discordPayload);
            break;
        case "gitlab":
            gitlab.parse(req, discordPayload);
            break;
        case "heroku":
            heroku.parse(req, discordPayload)
            break;
        case "travis":
            travis.parse(req, discordPayload);
            break;
        case "unity":
            unity.parse(req, discordPayload);
            break;
        default:
            console.log("Unknown from: " + provider);
            error = true;
            break;
    }

    if (error) {
        res.sendStatus(400);
        return;
    }
    var jsonString = JSON.stringify(discordPayload);
    //special case for testing. Kinda lame to do that, but meh
    if (test) {
        var testHookUrl = process.env.TEST_HOOK_URL;
        if (testHookUrl) {
            console.log("Sending to test url: " + testHookUrl)
            request.post({
                headers: { 'content-type': 'application/json' },
                url: discordHookUrl + provider,
                body: jsonString
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(jsonString);
                }
            });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(jsonString);
        }
    } else {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: discordHookUrl,
            body: jsonString
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
            }
        });
    }
});

// listen for requests :)
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

//for the tests!
module.exports = server
