/**
 * For running quick test things in node
 */
require('dotenv').config()

import axios from 'axios'
import * as fs from 'fs'
import { DiscordPayload } from './model/DiscordPayload'
import { AppVeyor } from './provider/Appveyor'
import { BaseProvider } from './provider/BaseProvider'
import { Heroku } from './provider/Heroku'
import { NewRelic } from './provider/NewRelic'
import { ErrorUtil } from './util/ErrorUtil'

testPayloadVisual(new Heroku(), 'heroku.json')

function testPayloadVisual(provider: BaseProvider, jsonFileName: string) {
    const json = fs.readFileSync(`./test/${jsonFileName}`, 'utf-8')
    provider.parse(JSON.parse(json)).then((discordPayload) => {
        sendPayload(discordPayload)
    }).catch((err) => {
        console.log(err)
        const payload = ErrorUtil.createErrorPayload(provider.getName(), err)
        sendPayload(payload)
    })
}

function sendPayload(discordPayload: DiscordPayload) {
    const discordEndpoint = process.env.TEST_HOOK
    if (discordEndpoint == null) {
        console.log('Endpoint is null. You should set it to test out the payload visuals')
        return
    }
    const jsonString = JSON.stringify(discordPayload)
    axios({
        data: jsonString,
        method: 'post',
        url: discordEndpoint
    }).then(() => {
        console.log('Sent')
    }).catch((err: any) => {
        console.log(err)
    })
}
