import * as fs from 'node:fs'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { type Context, Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { DiscordPayload } from './model/DiscordApi.ts'
import { AppCenter } from './provider/AppCenter.ts'
import { AppVeyor } from './provider/Appveyor.ts'
import { Basecamp } from './provider/Basecamp.ts'
import type { BaseProvider } from './provider/BaseProvider.ts'
import { BitBucketServer } from './provider/BitBucketServer.ts'
import { BitBucket } from './provider/Bitbucket.ts'
import { CircleCi } from './provider/CircleCi.ts'
import { Codacy } from './provider/Codacy.ts'
import { Confluence } from './provider/Confluence.ts'
import { DockerHub } from './provider/DockerHub.ts'
import { GitLab } from './provider/GitLab.ts'
import { Heroku } from './provider/Heroku.ts'
import { HuggingFace } from './provider/HuggingFace.ts'
import { Instana } from './provider/Instana.ts'
import { Jenkins } from './provider/Jenkins.ts'
import { Jira } from './provider/Jira.ts'
import { NewRelic } from './provider/NewRelic.ts'
import { Patreon } from './provider/Patreon.ts'
import { Pingdom } from './provider/Pingdom.ts'
import { Rollbar } from './provider/Rollbar.ts'
import { Travis } from './provider/Travis.ts'
import { Trello } from './provider/Trello.ts'
import { Unity } from './provider/Unity.ts'
import { UptimeRobot } from './provider/UptimeRobot.ts'
import { VSTS } from './provider/VSTS.ts'
import { ErrorUtil } from './util/ErrorUtil.ts'
import { logger } from './util/logger.ts'

logger.debug('Logger set up successfully.')

const app = new Hono()

type ProviderClass = new () => BaseProvider

const providers: ProviderClass[] = [
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
    HuggingFace,
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
    VSTS,
]

const providersMap = new Map<string, ProviderClass>()
const providerInfos: { name: string; path: string }[] = []
for (const Provider of providers) {
    const instance = new Provider()
    providersMap.set(instance.getPath(), Provider)
    logger.debug(`Adding provider: ${instance.getName()}`)
    providerInfos.push({
        name: instance.getName(),
        path: instance.getPath(),
    })
}

app.use('*', cors())
app.use(
    '*',
    bodyLimit({
        maxSize: 2 * 1024 * 1024, // 2MB
        onError: (c) => c.text('Request body too large. Maximum size is 2MB.', 413),
    }),
)
app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) => c.redirect('https://www.skyhookapi.com/'))

app.get('/api/providers', (c) => c.json(providerInfos, 200))

const info = {
    version: process.env.K_REVISION,
    deployment: process.env.K_SERVICE,
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

const server = serve(
    {
        fetch: app.fetch,
        port: typeof port === 'number' ? port : 8080,
    },
    (addressInfo) => {
        logger.debug(
            `Your app is listening on port ${addressInfo.port}. Test out with http://localhost:${addressInfo.port}/api/providers`,
        )
    },
)

function normalizePort(givenPort: string): string | number | boolean {
    const normalizedPort = parseInt(givenPort, 10)

    if (Number.isNaN(normalizedPort)) {
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
                'Content-Type': 'application/json',
            },
            body: jsonString,
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
