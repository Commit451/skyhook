require('dotenv').config()

import axios from 'axios'
import express from 'express'
import moment from 'moment'

import bodyParser from 'body-parser'
import winston from 'winston'

// Set up a logger.
// @ts-ignore Method exists, will be added to ts def in next release.
winston.loggers.add('logger', {
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${moment().format('YYYY-MM-DD hh:mm:ss').trim()}] [${info.level}]: ${info.message}`)
    ),
    level: process.env.PRODUCTION ? 'info' : 'debug',
    transports: [
        new winston.transports.Console()
    ]
})

// @ts-ignore Method exists, will be added to ts def in next release.
const logger = winston.loggers.get('logger')
logger.debug('Winston setup successfully.')

// Setup app.

const app = express()
const providers: any = {
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
    travis: require('./providers/travisci'),
    trello: require('./providers/trello'),
    unity: require('./providers/unity'),
    vsts: require('./providers/vsts'),
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    // response.sendFile(__dirname + '/views/index.ejs');
    const templProviders: any[] = []
    providers.array.forEach((provider: any) => {
        templProviders.push([provider, provider.getName()])
    })
    templProviders.sort()

    res.render('index', { providers: templProviders })
})

app.get('/providers', (req, res) => {
    res.status(200).send(getListOfProviderNamesSorted())
})

app.get('/api/webhooks/:webhookID/:webhookSecret/:from', (req, res) => {
    // Return 200 if the provider is valid to show this url is ready.
    const provider: any = req.params.from
    if (provider === null || providers[provider] === null) {
        res.sendStatus(400)
    } else {
        res.sendStatus(200)
    }
})

app.post('/api/webhooks/:webhookID/:webhookSecret/:from', async (req, res) => {
    const webhookID = req.params.webhookID
    const webhookSecret = req.params.webhookSecret
    const provider = req.params.from
    if (!webhookID || !webhookSecret || !provider) {
        res.sendStatus(400)
        return
    }
    const discordEndpoint = 'https://discordapp.com/api/webhooks/' + webhookID + '/' + webhookSecret

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    let discordPayload = null
    const error = false

    if (typeof providers[provider] !== 'undefined') {
        const instance = new providers[provider]()
        try {
            discordPayload = await instance.parse(req)
        } catch (error) {
            res.sendStatus(500)
            // Note sure of a better way to log errors in winston.
            logger.error('Error during parse: ' + error.stack)
            //console.log('Error during parse:', error)
        }
    } else {
        logger.error(`Unknown provider ${provider}`)
        res.sendStatus(400)
    }

    if (discordPayload !== null) {
        const jsonString = JSON.stringify(discordPayload)

        axios({
            data: jsonString,
            method: 'post',
            url: discordEndpoint,
        }).then(() => {
            res.sendStatus(200)
        }).catch((err: any) => {
            logger.error(error)
            res.sendStatus(400)
        })
    }
})

app.use((req, res, next) => {
    res.status(404).send('Not Found')
})

function normalizePort(val) {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        // named pipe
        return val
    }

    if (port >= 0) {
        // port number
        return port
    }

    return false
}

const port = normalizePort(process.env.PORT || 8080)

const server = app.listen(port, () => {
    logger.debug(`Your app is listening on port ${port}`)
})

function getListOfProviderNamesSorted(): string[] {
    const sortedProviders: string[] = []
    providers.forEach((provider: any) => {
        sortedProviders.push(provider.getName())
    })
    sortedProviders.sort()
    return sortedProviders
}

module.exports = server
