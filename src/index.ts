require('dotenv').config()

import axios from 'axios'
import bodyParser from 'body-parser'
import express from 'express'
import { BaseProvider } from './model/BaseProvider'
import { DiscordPayload } from './model/DiscordPayload'
import { ErrorUtil } from './util/ErrorUtil'
import { LoggerUtil } from './util/LoggerUtil'

import { AppVeyor } from './providers/Appveyor'
import { Bintray } from './providers/Bintray'
import { BitBucket } from './providers/Bitbucket'
import { CircleCi } from './providers/CircleCi'
import { Codacy } from './providers/Codacy'
import { DockerHub } from './providers/DockerHub'
import { GitLab } from './providers/GitLab'
import { Heroku } from './providers/Heroku'
import { Jenkins } from './providers/Jenkins'
import { Patreon } from './providers/Patreon'
import { Pingdom } from './providers/Pingdom'
import { Travis } from './providers/Travis'
import { Trello } from './providers/Trello'
import { Unity } from './providers/Unity'
import { VSTS } from './providers/VSTS'

LoggerUtil.init()

const logger = LoggerUtil.logger()
logger.debug('Winston setup successfully.')

const app = express()

/**
 * Array of the classes
 */
const providers: any[] = [
    AppVeyor,
    Bintray,
    BitBucket,
    CircleCi,
    Codacy,
    DockerHub,
    GitLab,
    Heroku,
    Jenkins,
    Patreon,
    Pingdom,
    Travis,
    Trello,
    Unity,
    VSTS
]

const providersMap = new Map<string, any>()
const providerNames: string[] = []
const providerInstances: BaseProvider[] = []
const providerInfos: any[] = []
providers.forEach((Provider) => {
    const instance = new Provider()
    providerInstances.push(instance)
    providersMap.set(instance.getPath(), Provider)
    console.log(`Adding provider name ${instance.getName()}`)
    providerNames.push(instance.getName())
    const providerInfo = {
        name: instance.getName(),
        path: instance.getPath()
    }
    providerInfos.push(providerInfo)
})
providerNames.sort()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', { providers: providerInfos })
})

app.get('/providers', (req, res) => {
    res.status(200).send(providerNames)
})

app.get('/api/webhooks/:webhookID/:webhookSecret/:from', (req, res) => {
    // Return 200 if the provider is valid to show this url is ready.
    const provider: any = req.params.from
    if (provider == null || providersMap.get(provider) == null) {
        logger.error(`Unknown provider: ${provider}`)
        res.sendStatus(400)
    } else {
        res.sendStatus(200)
    }
})

app.post('/api/webhooks/:webhookID/:webhookSecret/:from', async (req, res) => {
    const webhookID = req.params.webhookID
    const webhookSecret = req.params.webhookSecret
    const providerName = req.params.from
    if (!webhookID || !webhookSecret || !providerName) {
        res.sendStatus(400)
        return
    }
    const discordEndpoint = 'https://discordapp.com/api/webhooks/' + webhookID + '/' + webhookSecret

    let discordPayload: DiscordPayload = null
    const error = false

    const Provider = providersMap.get(providerName)
    if (Provider != null) {
        const instance: BaseProvider = new Provider()
        try {
            // seems dumb, but this is the best way I know how to format these headers in a way we can use them
            const headersString = JSON.stringify(req.headers)
            const headersObject = JSON.parse(headersString)
            discordPayload = await instance.parse(req.body, headersObject)
        } catch (error) {
            res.sendStatus(500)
            logger.error('Error during parse: ' + error.stack)
            discordPayload = ErrorUtil.createErrorPayload(providerName, error)
        }
    } else {
        logger.error(`Unknown provider ${providerName}`)
        res.sendStatus(400)
    }

    if (discordPayload != null) {
        const jsonString = JSON.stringify(discordPayload)
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
})

app.use((req, res, next) => {
    res.status(404).send('Not Found')
})

const port = normalizePort(process.env.PORT || '8080')

const server = app.listen(port, () => {
    logger.debug(`Your app is listening on port ${port}`)
})

function normalizePort(givenPort: string) {
    const normalizedPort = parseInt(givenPort, 10)

    if (isNaN(normalizedPort)) {
        // named pipe
        return givenPort
    }

    if (normalizedPort >= 0) {
        // port number
        return normalizedPort
    }

    return false
}

module.exports = server
