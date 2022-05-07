/**
 * For running quick test things in node. Just run `npm run visualtest` after modifying
 */
import dotenv from 'dotenv'
import axios from 'axios'
import * as fs from 'fs'
import { DiscordPayload } from './model/DiscordApi'
import { BaseProvider } from './provider/BaseProvider'
import { ErrorUtil } from './util/ErrorUtil'
import { CircleCi } from './provider/CircleCi'

dotenv.config()

//testPayloadVisual(new GitLab(), 'gitlab', 'gitlab.json')
testPayloadVisual(new CircleCi(), 'circleci', 'circleci-no-subject.json')
//testPayloadVisual(new AppVeyor(), 'appveyor', 'appveyor.json')

function testPayloadVisual(provider: BaseProvider, providerName: string, jsonFileName: string): void {
    const json = fs.readFileSync(`./test/${providerName}/${jsonFileName}`, 'utf-8')
    provider.parse(JSON.parse(json)).then((discordPayload) => {
        if (discordPayload != null) {
            sendPayload(discordPayload)
        } else {
            console.log('Payload is null.')
        }
    }).catch((err) => {
        console.log(err)
        const payload = ErrorUtil.createErrorPayload(provider.getName(), err)
        sendPayload(payload)
    })
}

function sendPayload(discordPayload: DiscordPayload): void {
    const discordEndpoint = process.env.TEST_HOOK
    if (discordEndpoint == null) {
        console.log('Endpoint is null. You should set it to test out the payload visuals')
        return
    }
    const jsonString = JSON.stringify(discordPayload)
    console.log(jsonString)
    console.log(`Sending payload to ${discordEndpoint}`)
    axios({
        data: jsonString,
        method: 'post',
        url: discordEndpoint,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        console.log('sent')
    }).catch((err) => {
        if (err.response) {
            console.log(err.response.data)
            console.log(err.response.status)
            console.log(err.response.headers)
        }
    })
}
