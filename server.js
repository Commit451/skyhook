// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const DiscordPayload = require('./util/DiscordPayload');
const appveyor = require('./providers/appveyor');
const bitbucket = require('./providers/bitbucket');
const circleci = require('./providers/circleci');
const gitlab = require('./providers/gitlab');
const heroku = require('./providers/heroku');
const travis = require('./providers/travis');
const unity = require('./providers/unity');
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post("/api/webhooks/:hookPart1/:hookPart2/:from", function (req, res) {

    let hookPart1 = req.params.hookPart1;
    let hookPart2 = req.params.hookPart2;
    let provider = req.params.from;
    const test = req.get("test");
    if (!hookPart1 || !hookPart2 || !provider) {
        res.sendStatus(400);
        return;
    }
    const discordHookUrl = "https://discordapp.com/api/webhooks/" + hookPart1 + "/" + hookPart2;

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    let discordPayload = new DiscordPayload();
    let error = false;
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
            heroku.parse(req, discordPayload);
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
    let jsonString = JSON.stringify(discordPayload.getData());
    //special case for testing. Kinda lame to do that, but meh
    if (test) {
        const testHookUrl = process.env.TEST_HOOK_URL;
        if (testHookUrl) {
            console.log("Sending to test url: " + testHookUrl);
            request.post({
                headers: {'content-type': 'application/json'},
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
            headers: {'content-type': 'application/json'},
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
const server = app.listen(process.env.PORT || 8080, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

//for the tests!
module.exports = server;
