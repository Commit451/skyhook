import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type ProviderExampleFiles = {
    body: string
    headers?: string
    query?: string
}

export type ProviderExample = {
    body: Record<string, unknown>
    headers: Record<string, string> | null
    query: Record<string, string>
}

const providerExamples: Record<string, ProviderExampleFiles> = {
    appcenter: { body: 'appcenter/appcenter-pipeline.json' },
    appveyor: { body: 'appveyor/appveyor.json' },
    basecamp: { body: 'basecamp/basecamp.json' },
    bitbucket: {
        body: 'bitbucket/bitbucket.json',
        headers: 'bitbucket/bitbucket.headers.json',
    },
    bitbucketserver: {
        body: 'bitbucketserver/bitbucketserver.json',
        headers: 'bitbucketserver/bitbucketserver.headers.json',
    },
    circleci: { body: 'circleci/circleci.json' },
    codacy: { body: 'codacy/codacy.json' },
    confluence: { body: 'confluence/confluence_page.json' },
    dockerhub: { body: 'dockerhub/dockerhub.json' },
    gitlab: { body: 'gitlab/gitlab.json' },
    heroku: { body: 'heroku/heroku.json' },
    huggingface: { body: 'huggingface/huggingface.json' },
    instana: { body: 'instana/instana.json' },
    jenkins: { body: 'jenkins/jenkins.json' },
    jira: { body: 'jira/jira-issue.json' },
    newrelic: { body: 'newrelic/newrelic.json' },
    patreon: {
        body: 'patreon/patreon-member-create.json',
        headers: 'patreon/patreon.headers.json',
    },
    pingdom: { body: 'pingdom/pingdom.json' },
    rollbar: { body: 'rollbar/rollbar.json' },
    travis: { body: 'travis/travis.json' },
    trello: { body: 'trello/trello.json' },
    unity: { body: 'unity/unity.json' },
    uptimerobot: { body: 'uptimerobot/uptimerobot.json' },
    vsts: { body: 'vsts/vsts.json' },
}

const examplesRoot = fileURLToPath(new URL('../examples/', import.meta.url))

export const providerExamplePaths = Object.freeze(Object.keys(providerExamples))

export function loadProviderExample(providerPath: string): ProviderExample {
    const files = providerExamples[providerPath]
    if (files == null) {
        throw new Error(`No example payload is registered for provider ${providerPath}.`)
    }

    return {
        body: readJson<Record<string, unknown>>(files.body),
        headers: files.headers == null ? null : readJson<Record<string, string>>(files.headers),
        query: files.query == null ? {} : readJson<Record<string, string>>(files.query),
    }
}

function readJson<T extends Record<string, unknown>>(relativePath: string): T {
    const absolutePath = resolve(examplesRoot, relativePath)
    return JSON.parse(readFileSync(absolutePath, 'utf-8')) as T
}
