// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const request = require('request');
const winston = require('winston');

// Set up a logger.
winston.loggers.add('logger', {
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${moment().format('YYYY-MM-DD hh:mm:ss').trim()}] [${info.level}]: ${info.message}`)
    ),
    level: process.env.PRODUCTION ? 'info' : 'debug',
    transports: [
        new winston.transports.Console()
    ]
});

const logger = winston.loggers.get('logger');
logger.debug('Winston setup successfully.');

// Setup app.

let app = express();
const providers = {
    appveyor: require('./providers/appveyor'),
    bintray: require('./providers/bintray'),
    bitbucket: require('./providers/bitbucket'),
    circleci: require('./providers/circleci'),
    codacy: require('./providers/codacy'),
    dockerhub: require('./providers/dockerhub'),
    gitlab: require('./providers/gitlab'),
    heroku: require('./providers/heroku'),
    jenkins: require('./providers/jenkins'),
    patreon: require('./providers/patreon'),
    pingdom: require('./providers/pingdom'),
    trello: require('./providers/trello'),
    travis: require('./providers/travis'),
    unity: require('./providers/unity'),
    vsts: require('./providers/vsts')
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

app.get("/providers", function (request, response) {
    response.status(200).send(getListOfProviderNamesSorted());
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
        try {
            discordPayload = await instance.parse(req);
        } catch (error) {
            res.sendStatus(500);
            // Note sure of a better way to log errors in winston.
            logger.error('Error during parse: ' + error.stack);
            //console.log('Error during parse:', error);
        }
    } else {
        logger.error('Unknown provider "' + provider + '"');
        res.sendStatus(400)
    }

    if (discordPayload !== null) {
        let jsonString = JSON.stringify(discordPayload);
        if (test) {
            const testHookUrl = process.env.TEST_HOOK_URL;
            if (testHookUrl) {
                logger.debug("Sending to test url: " + testHookUrl);
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
                    logger.error(error);
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    }
});

//Keep these two at the end
app.use(function (req, res, next) {
    res.status(404).send('Not Found');
});

app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// listen for requests :)
const server = app.listen(process.env.PORT || 8080, function () {
    logger.debug(`Your app is listening on port ${server.address().port}.`);
});

function getListOfProviderNamesSorted() {
    const sortedProviders = [];
    for (const prov in providers) {
        sortedProviders.push(providers[prov].getName());
    }
    sortedProviders.sort();
    return sortedProviders;
}

//for the tests!
module.exports = server;
