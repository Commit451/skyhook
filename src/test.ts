/**
 * For running quick test things in node
 */
import dotenv from 'dotenv'
import axios from 'axios'
import * as fs from 'fs'
import { DiscordPayload } from './model/DiscordApi'
import { BaseProvider } from './provider/BaseProvider'
import { Heroku } from './provider/Heroku'
import { ErrorUtil } from './util/ErrorUtil'

dotenv.config()

testPayloadVisual(new Heroku(), 'heroku', 'heroku.json')

function testPayloadVisual(provider: BaseProvider, providerName: string, jsonFileName: string): void {
    const json = fs.readFileSync(`./test/${providerName}/${jsonFileName}`, 'utf-8')
    provider.parse(JSON.parse(json)).then((discordPayload) => {
        if(discordPayload != null) {
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
    console.log(`Sending payload to ${discordEndpoint}`)
    axios({
        data: jsonString,
        method: 'post',
        url: discordEndpoint
    }).then(() => {
        console.log('Sent')
    }).catch((err) => {
        console.log('Error sending to discord', err)
    })
}
