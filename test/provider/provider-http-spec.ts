import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { defineProvider, type ProviderHttpPolicy } from '../../src/provider/Provider.ts'
import { ProviderRegistry } from '../../src/provider/ProviderRegistry.ts'
import { ProviderRunner } from '../../src/provider/ProviderRunner.ts'

const example = { body: 'dockerhub/dockerhub.json' }

afterEach(() => mock.restoreAll())

function createRunner(policy?: ProviderHttpPolicy): ProviderRunner {
    const provider = defineProvider({
        path: 'http',
        name: 'HTTP',
        example,
        http: policy,
        async map({ body, http }, output) {
            const result = await http.getJson<{ value: string }>(String(body.url))
            output.payload.content = result.value
        },
    })
    return new ProviderRunner(new ProviderRegistry([provider]))
}

describe('provider HTTP capability', () => {
    it('permits bounded JSON GETs to explicitly trusted HTTPS hosts', async () => {
        let requestInit: RequestInit | undefined
        mock.method(globalThis, 'fetch', async (_input: string | URL | Request, init?: RequestInit) => {
            requestInit = init
            return new Response(JSON.stringify({ value: 'loaded' }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            })
        })
        const runner = createRunner({ allowedHosts: ['api.example.com'], timeoutMs: 100, maxResponseBytes: 100 })

        const payload = await runner.run('http', { body: { url: 'https://api.example.com/value' } })

        assert.equal(payload?.content, 'loaded')
        assert.equal(requestInit?.redirect, 'error')
        assert.equal(requestInit?.headers && new Headers(requestInit.headers).get('accept'), 'application/json')
        assert.ok(requestInit?.signal instanceof AbortSignal)
    })

    it('denies networking unless the definition explicitly opts in', async () => {
        const runner = createRunner()

        await assert.rejects(
            runner.run('http', { body: { url: 'https://api.example.com/value' } }),
            /not permitted to make HTTP requests/,
        )
    })

    it('rejects insecure schemes, credentials, ports, and untrusted hosts before fetching', async () => {
        const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('{}'))
        const runner = createRunner({ allowedHosts: ['api.example.com'] })

        await assert.rejects(runner.run('http', { body: { url: 'http://api.example.com/value' } }), /must use HTTPS/)
        await assert.rejects(
            runner.run('http', { body: { url: 'https://user:secret@api.example.com/value' } }),
            /must not contain credentials/,
        )
        await assert.rejects(
            runner.run('http', { body: { url: 'https://api.example.com:8443/value' } }),
            /default HTTPS port/,
        )
        await assert.rejects(
            runner.run('http', { body: { url: 'https://api.example.com.evil/value' } }),
            /host is not allowed/,
        )
        assert.equal(fetchMock.mock.callCount(), 0)
    })

    it('rejects unsuccessful and oversized responses', async () => {
        const runner = createRunner({ allowedHosts: ['api.example.com'], maxResponseBytes: 16 })
        let call = 0
        mock.method(globalThis, 'fetch', async () => {
            call += 1
            if (call === 1) return new Response('{}', { status: 503 })
            if (call === 2) return new Response('{}', { status: 200, headers: { 'content-length': '17' } })
            return new Response(JSON.stringify({ value: 'more than sixteen bytes' }), { status: 200 })
        })

        await assert.rejects(runner.run('http', { body: { url: 'https://api.example.com/value' } }), /status 503/)
        await assert.rejects(runner.run('http', { body: { url: 'https://api.example.com/value' } }), /size limit/)
        await assert.rejects(runner.run('http', { body: { url: 'https://api.example.com/value' } }), /size limit/)
    })

    it('rejects invalid JSON rather than returning untrusted text', async () => {
        mock.method(globalThis, 'fetch', async () => new Response('not-json', { status: 200 }))
        const runner = createRunner({ allowedHosts: ['api.example.com'] })

        await assert.rejects(runner.run('http', { body: { url: 'https://api.example.com/value' } }), SyntaxError)
    })
})
