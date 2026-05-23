import dotenv from 'dotenv'
import { Hono, type Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { DiscordPayload } from './model/DiscordApi.js'
import { BaseProvider } from './provider/BaseProvider.js'
import { ErrorUtil } from './util/ErrorUtil.js'
import { LoggerUtil } from './util/LoggerUtil.js'
import * as fs from 'fs'

import { AppCenter } from './provider/AppCenter.js'
import { AppVeyor } from './provider/Appveyor.js'
import { Basecamp } from './provider/Basecamp.js'
import { BitBucket } from './provider/Bitbucket.js'
import { BitBucketServer } from './provider/BitBucketServer.js'
import { CircleCi } from './provider/CircleCi.js'
import { Codacy } from './provider/Codacy.js'
import { Confluence } from './provider/Confluence.js'
import { DockerHub } from './provider/DockerHub.js'
import { GitLab } from './provider/GitLab.js'
import { Heroku } from './provider/Heroku.js'
import { Instana } from './provider/Instana.js'
import { Jenkins } from './provider/Jenkins.js'
import { Jira } from './provider/Jira.js'
import { NewRelic } from './provider/NewRelic.js'
import { Patreon } from './provider/Patreon.js'
import { Pingdom } from './provider/Pingdom.js'
import { Rollbar } from './provider/Rollbar.js'
import { Travis } from './provider/Travis.js'
import { Trello } from './provider/Trello.js'
import { Unity } from './provider/Unity.js'
import { UptimeRobot } from './provider/UptimeRobot.js'
import { VSTS } from './provider/VSTS.js'
import { Type } from './util/TSUtility.js'

dotenv.config()

LoggerUtil.init()

const logger = LoggerUtil.logger()
logger.debug('Logger set up successfully.')

const app = new Hono()

const providers: Type<BaseProvider>[] = [
    AppCenter,
    AppVeyor,
    Basecamp,
    BitBucket,
    BitBucketServer,
    CircleCi,
    Codacy,
    Confluence,
    DockerHub,
    GitLab,
    Heroku,
    Instana,
    Jenkins,
    Jira,
    NewRelic,
    Patreon,
    Pingdom,
    Rollbar,
    Travis,
    Trello,
    Unity,
    UptimeRobot,
    VSTS
]

const providersMap = new Map<string, Type<BaseProvider>>()
const providerNames: string[] = []
const providerInstances: BaseProvider[] = []
const providerInfos: { name: string, path: string }[] = []
providers.forEach((Provider) => {
    const instance = new Provider()
    providerInstances.push(instance)
    providersMap.set(instance.getPath(), Provider)
    logger.debug(`Adding provider: ${instance.getName()}`)
    providerNames.push(instance.getName())
    const providerInfo = {
        name: instance.getName(),
        path: instance.getPath()
    }
    providerInfos.push(providerInfo)
})
providerNames.sort()

app.use('*', cors())
app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) => c.redirect('https://commit451.github.io/skyhook-web'))

app.get('/api/providers', (c) => c.json(providerInfos, 200))

const info = {
    version: process.env.K_REVISION,
    deployment: process.env.K_SERVICE
}
app.get('/api/info', (c) => c.json(info, 200))

app.get('/api/webhooks/:webhookID/:webhookSecret/:from', (c) => {
    // Return 200 if the provider is valid to show this url is ready.
    const provider = c.req.param('from')
    if (provider == null || providersMap.get(provider) == null) {
        const errorMessage = `Unknown provider ${provider}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }
    return c.body(null, 200)
})

app.post('/api/webhooks/:webhookID/:webhookSecret/:from', async (c) => {
    const webhookID = c.req.param('webhookID')
    const webhookSecret = c.req.param('webhookSecret')
    const providerPath = c.req.param('from')
    if (!webhookID || !webhookSecret || !providerPath) {
        return c.body(null, 400)
    }
    const discordEndpoint = `https://discordapp.com/api/webhooks/${webhookID}/${webhookSecret}`

    let discordPayload: DiscordPayload | null = null

    const Provider = providersMap.get(providerPath)
    if (Provider == null) {
        const errorMessage = `Unknown provider ${providerPath}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }

    const instance = new Provider()
    try {
        const queryObject = c.req.query()
        console.log(queryObject)
        const headersObject: Record<string, string> = {}
        c.req.raw.headers.forEach((value, key) => {
            headersObject[key] = value
        })
        const body = await parseRequestBody(c)
        discordPayload = await instance.parse(body, headersObject, queryObject)
    } catch (error) {
        logger.error('Error during parse: ' + error.stack)
        discordPayload = ErrorUtil.createErrorPayload(providerPath, error)
        return sendPayload(providerPath, discordPayload, discordEndpoint, c, 500)
    }

    return sendPayload(providerPath, discordPayload, discordEndpoint, c)
})

app.post('/api/webhooks/:webhookID/:webhookSecret/:from/test', async (c) => {
    const webhookID = c.req.param('webhookID')
    const webhookSecret = c.req.param('webhookSecret')
    const providerPath = c.req.param('from')
    if (!webhookID || !webhookSecret || !providerPath) {
        return c.body(null, 400)
    }
    const discordEndpoint = `https://discordapp.com/api/webhooks/${webhookID}/${webhookSecret}`
    const Provider = providersMap.get(providerPath)
    if (Provider == null) {
        const errorMessage = `Unknown provider ${providerPath}`
        logger.error(errorMessage)
        return c.text(errorMessage, 400)
    }
    const provider = new Provider()
    const jsonFileName = `${providerPath}.json`
    const json = fs.readFileSync(`./test/${providerPath}/${jsonFileName}`, 'utf-8')
    const discordPayload = await provider.parse(JSON.parse(json))
    return sendPayload(providerPath, discordPayload, discordEndpoint, c)
})

app.notFound((c) => c.text('Not Found', 404))

const port = normalizePort(process.env.PORT || '8080')

const server = serve({
    fetch: app.fetch,
    port: typeof port === 'number' ? port : 8080
}, (addressInfo) => {
    logger.debug(`Your app is listening on port ${addressInfo.port}. Test out with http://localhost:${addressInfo.port}/api/providers`)
})

function normalizePort(givenPort: string): string | number | boolean {
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

/**
 * Parses the request body based on its Content-Type. Falls back to JSON if the
 * Content-Type is missing or unrecognized so providers that omit headers still work.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseRequestBody(c: Context): Promise<any> {
    const contentType = (c.req.header('content-type') || '').toLowerCase()
    if (contentType.includes('application/json')) {
        return c.req.json()
    }
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        return c.req.parseBody()
    }
    try {
        return await c.req.json()
    } catch {
        return {}
    }
}

/**
 * Sends the correctly formatted payload to the Discord channel
 */
async function sendPayload(
    providerPath: string,
    discordPayload: DiscordPayload | null,
    discordEndpoint: string,
    c: Context,
    upstreamStatusOverride?: ContentfulStatusCode,
): Promise<Response> {
    if (discordPayload == null) {
        logger.error('Discord payload is null')
        return c.text(`Webhook event is either not supported or not implemented by /${providerPath}.`, 200)
    }
    // We could implement a more robust validation on this at some point.
    if (Object.keys(discordPayload).length === 0) {
        logger.error('Bad implementation, outbound payload is empty.')
        return c.text('Bad implementation.', 500)
    }
    const jsonString = JSON.stringify(discordPayload)
    try {
        const response = await fetch(discordEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`Discord webhook responded with ${response.status}: ${errorBody}`)
        }
        return c.body(null, upstreamStatusOverride ?? 200)
    } catch (err) {
        logger.error(err)
        return c.text(String(err), 500)
    }
}

export default server
