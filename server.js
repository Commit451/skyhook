// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

let app = express();
const providers = {
    appveyor: require('./providers/appveyor'),
    bitbucket: require('./providers/bitbucket'),
    circleci: require('./providers/circleci'),
    codacy: require('./providers/codacy'),
    gitlab: require('./providers/gitlab'),
    heroku: require('./providers/heroku'),
    jenkins: require('./providers/jenkins'),
    patreon: require('./providers/patreon'),
    trello: require('./providers/trello'),
    travis: require('./providers/travis'),
    unity: require('./providers/unity')
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.set('view engine', 'ejs');

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    //response.sendFile(__dirname + '/views/index.ejs');
    const templProviders = [];
    for (const prov in providers) {
        templProviders.push([prov, providers[prov].getName()]);
    }
    templProviders.sort();

    response.render('index', {providers: templProviders});
});

app.get("/api/webhooks/:webhookID/:webhookSecret/:from", function (req, res) {
    //Return 200 if the provider is valid to show this url is ready.
    let provider = req.params.from;
    if (provider === null || providers[provider] === null) {
        res.sendStatus(400);
    } else {
        res.sendStatus(200);
    }
});

app.post("/api/webhooks/:webhookID/:webhookSecret/:from", async function (req, res) {
    let webhookID = req.params.webhookID;
    let webhookSecret = req.params.webhookSecret;
    let provider = req.params.from;
    const test = req.get("test");
    if (!webhookID || !webhookSecret || !provider) {
        res.sendStatus(400);
        return;
    }
    const discordEndpoint = "https://discordapp.com/api/webhooks/" + webhookID + "/" + webhookSecret;

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    let discordPayload = null;
    let error = false;

    if (typeof providers[provider] !== 'undefined') {
        const instance = new providers[provider]();
        discordPayload = await instance.parse(req);
    } else {
        console.log('Unknown provider "' + provider + '"');
    }

    if (discordPayload !== null) {
        let jsonString = JSON.stringify(discordPayload);
        if (test) {
            const testHookUrl = process.env.TEST_HOOK_URL;
            if (testHookUrl) {
                console.log("Sending to test url: " + testHookUrl);
                request.post({
                    headers: {'content-type': 'application/json'},
                    url: discordEndpoint + provider,
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
                url: discordEndpoint,
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
    }
});

// listen for requests :)
const server = app.listen(process.env.PORT || 8080, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

//for the tests!
module.exports = server;
