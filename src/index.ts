require('dotenv').config()

import axios from 'axios'
import bodyParser from 'body-parser'
import express from 'express'
import { DiscordPayload } from './model/DiscordPayload'
import { BaseProvider } from './provider/BaseProvider'
import { ErrorUtil } from './util/ErrorUtil'
import { LoggerUtil } from './util/LoggerUtil'

import { AppVeyor } from './provider/Appveyor'
import { Bintray } from './provider/Bintray'
import { BitBucket } from './provider/Bitbucket'
import { CircleCi } from './provider/CircleCi'
import { Codacy } from './provider/Codacy'
import { DockerHub } from './provider/DockerHub'
import { GitLab } from './provider/GitLab'
import { Heroku } from './provider/Heroku'
import { Jenkins } from './provider/Jenkins'
import { Jira } from './provider/Jira'
import { NewRelic } from './provider/NewRelic'
import { Patreon } from './provider/Patreon'
import { Pingdom } from './provider/Pingdom'
import { Travis } from './provider/Travis'
import { Trello } from './provider/Trello'
import { Unity } from './provider/Unity'
import { UptimeRobot } from './provider/UptimeRobot'
import { VSTS } from './provider/VSTS'

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
    Jira,
    NewRelic,
    Patreon,
    Pingdom,
    Travis,
    Trello,
    Unity,
    UptimeRobot,
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
        const errorMessage = `Unknown provider ${provider}`
        logger.error(errorMessage)
        res.status(400).send(errorMessage)
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
    const discordEndpoint = `https://discordapp.com/api/webhooks/${webhookID}/${webhookSecret}`

    let discordPayload: DiscordPayload = null

    const Provider = providersMap.get(providerName)
    if (Provider != null) {
        const instance: BaseProvider = new Provider()
        try {
            const queryString = JSON.stringify(req.query)
            const queryObject = JSON.parse(queryString)
            console.log(queryObject)
            // seems dumb, but this is the best way I know how to format these headers in a way we can use them
            const headersString = JSON.stringify(req.headers)
            const headersObject = JSON.parse(headersString)
            discordPayload = await instance.parse(req.body, headersObject, queryObject)
        } catch (error) {
            res.sendStatus(500)
            logger.error('Error during parse: ' + error.stack)
            discordPayload = ErrorUtil.createErrorPayload(providerName, error)
        }
    } else {
        const errorMessage = `Unknown provider ${providerName}`
        logger.error(errorMessage)
        res.status(400).send(errorMessage)
    }

    if (discordPayload != null) {
        const jsonString = JSON.stringify(discordPayload)
        axios({
            data: jsonString,
            method: 'post',
            url: discordEndpoint,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            res.sendStatus(200)
        }).catch((err: any) => {
            logger.error(err)
            res.status(502).send(err)
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
