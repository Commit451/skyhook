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
        winston.format.printf((info) => `[${moment().format('YYYY-MM-DD hh:mm:ss').trim()}] [${info.level}]: ${info.message}`)
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

const appveyor = require('./providers/Appveyor')
const bintray = require('./providers/Bintray')
const bitbucket = require('./providers/Bitbucket')
const circleci = require('./providers/CircleCi')
const codacy = require('./providers/Codacy')
const dockerhub = require('./providers/DockerHub')
const gitlab = require('./providers/GitLab')
const heroku = require('./providers/Heroku')
const jenkins = require('./providers/Jenkins')
const patreon = require('./providers/Patreon')
const pingdom = require('./providers/Pingdom')
const travis = require('./providers/Travis')
const trello = require('./providers/Trello')
const unity = require('./providers/Unity')
const vsts = require('./providers/VSTS')

/**
 * Array of the classes
 */
const providers: any[] = [
    appveyor,
    bintray,
    bitbucket,
    circleci,
    codacy,
    dockerhub,
    gitlab,
    heroku,
    jenkins,
    patreon,
    pingdom,
    travis,
    trello,
    unity,
    vsts
]

const providersMap = new Map<string, any>()
const providerNames: string[] = []
providers.forEach((Provider) => {
    const instance = new Provider()
    providersMap.set(instance.getPath(), Provider)
    console.log(`Adding provider name ${instance.getName()}`)
    providerNames.push(instance.getName())
})
providerNames.sort()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', { providers: providerNames })
})

app.get('/providers', (req, res) => {
    res.status(200).send(providerNames)
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
    const providerName = req.params.from
    const test = req.get('test')
    if (!webhookID || !webhookSecret || !providerName) {
        res.sendStatus(400)
        return
    }
    const discordEndpoint = 'https://discordapp.com/api/webhooks/' + webhookID + '/' + webhookSecret

    // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    let discordPayload = null
    const error = false

    const Provider = providersMap.get(providerName)
    if (Provider !== null && typeof Provider !== 'undefined') {
        const instance = new Provider()
        try {
            discordPayload = await instance.parse(req)
        } catch (error) {
            res.sendStatus(500)
            // Note sure of a better way to log errors in winston.
            logger.error('Error during parse: ' + error.stack)
            // console.log('Error during parse:', error)
        }
    } else {
        logger.error(`Unknown provider ${providerName}`)
        res.sendStatus(400)
    }

    if (discordPayload !== null) {
        const jsonString = JSON.stringify(discordPayload)

        if (test) {
            res.setHeader('Content-Type', 'application/json')
            res.send(jsonString)
        } else {
            axios({
                data: jsonString,
                method: 'post',
                url: discordEndpoint
            }).then(() => {
                res.sendStatus(200)
            }).catch((err: any) => {
                logger.error(error)
                res.sendStatus(400)
            })

        }
    }
})

app.use((req, res, next) => {
    res.status(404).send('Not Found')
})

function normalizePort(val) {
    const normalizedPort = parseInt(val, 10)

    if (isNaN(normalizedPort)) {
        // named pipe
        return val
    }

    if (normalizedPort >= 0) {
        // port number
        return normalizedPort
    }

    return false
}

const port = normalizePort(process.env.PORT || 8080)

const server = app.listen(port, () => {
    logger.debug(`Your app is listening on port ${port}`)
})

module.exports = server
