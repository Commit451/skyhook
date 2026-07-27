import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { Buildkite } from '../../src/provider/Buildkite.ts'
import { validateDiscordPayload } from '../../src/util/DiscordPayloadValidator.ts'
import { Tester } from '../Tester.ts'

const sender = {
    id: '8a7693f8-dbae-4783-9137-84090fce9045',
    name: 'Buildkite User',
}

const pipeline = {
    id: '849411f9-9e6d-4739-a0d8-e247088e9b52',
    web_url: 'https://buildkite.com/acme-inc/my-pipeline',
    name: 'My Pipeline',
    slug: 'my-pipeline',
}

const build = {
    id: '01908131-7d9f-495e-a17b-80ed31276810',
    web_url: 'https://buildkite.com/acme-inc/my-pipeline/builds/27',
    number: 27,
    state: 'running',
    blocked: false,
    message: 'Build the next release',
    commit: 'a1b2c3d4e5f678901234567890abcdef12345678',
    branch: 'main',
    source: 'webhook',
    created_at: '2026-07-27T14:20:00.000Z',
    scheduled_at: '2026-07-27T14:20:01.000Z',
    started_at: '2026-07-27T14:20:05.000Z',
}

describe('/POST buildkite', () => {
    it('exposes provider metadata', () => {
        const provider = Buildkite

        assert.equal(provider.name, 'Buildkite')
        assert.equal(provider.path, 'buildkite')
    })

    it('formats the canonical build fixture used by example delivery', async () => {
        const example = loadProviderExample('buildkite')
        const result = await Tester.testWithBody(Buildkite, example.body, example.headers, example.query)

        assert.notEqual(result, null)
        assert.equal(result!.username, 'Buildkite')
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds?.length, 1)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'My Pipeline build \\#27 passed')
        assert.equal(embed.url, 'https://buildkite.com/acme-inc/my-pipeline/builds/27')
        assert.equal(embed.description, 'Add Buildkite webhook support')
        assert.equal(embed.timestamp, '2026-07-27T14:22:30.123Z')
        assert.equal(embed.color, 0x14cc80)
        assert.deepEqual(embed.author, { name: 'Buildkite User' })
        assert.deepEqual(embed.fields, [
            { name: 'Branch', value: 'main', inline: true },
            { name: 'Commit', value: 'a1b2c3d', inline: true },
            { name: 'Source', value: 'Webhook', inline: true },
        ])
    })

    it('formats build lifecycle events and blocked builds', async () => {
        const running = await Tester.testWithBody(
            Buildkite,
            { event: 'build.running', build, pipeline, sender },
            { 'X-Buildkite-Event': 'build.running' },
        )
        assert.notEqual(running, null)
        assert.equal(running!.embeds![0].title, 'My Pipeline build \\#27 running')
        assert.equal(running!.embeds![0].timestamp, '2026-07-27T14:20:05.000Z')

        const failing = await Tester.testWithBody(Buildkite, {
            event: 'build.failing',
            build: { ...build, state: 'passed', failing_at: '2026-07-27T14:24:00Z' },
            pipeline,
            sender,
        })
        assert.notEqual(failing, null)
        assert.equal(failing!.embeds![0].title, 'My Pipeline build \\#27 failing')
        assert.equal(failing!.embeds![0].color, 0xe53935)

        const blocked = await Tester.testWithBody(Buildkite, {
            event: 'build.finished',
            build: { ...build, state: 'blocked', blocked: true, finished_at: '2026-07-27T14:25:00Z' },
            pipeline,
            sender,
        })
        assert.notEqual(blocked, null)
        assert.equal(blocked!.embeds![0].title, 'My Pipeline build \\#27 blocked')
        assert.equal(blocked!.embeds![0].color, 0xf0b429)
    })

    it('formats job events with build and execution details', async () => {
        const result = await Tester.testWithBody(Buildkite, {
            event: 'job.finished',
            job: {
                id: 'b63254c0-3271-4a98-8270-7cfbd6c2f14e',
                type: 'script',
                name: 'Test **suite**',
                state: 'failed',
                web_url: 'https://buildkite.com/acme-inc/my-pipeline/builds/27#b63254c0-3271-4a98-8270-7cfbd6c2f14e',
                exit_status: 1,
                soft_failed: false,
                agent: { name: 'runner_1' },
                finished_at: '2026-07-27T14:23:00.500Z',
            },
            build,
            pipeline,
            sender,
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'My Pipeline build \\#27: Test \\*\\*suite\\*\\* failed')
        assert.equal(
            embed.url,
            'https://buildkite.com/acme-inc/my-pipeline/builds/27#b63254c0-3271-4a98-8270-7cfbd6c2f14e',
        )
        assert.equal(embed.timestamp, '2026-07-27T14:23:00.500Z')
        assert.deepEqual(embed.fields, [
            { name: 'Branch', value: 'main', inline: true },
            { name: 'Exit status', value: '1', inline: true },
            { name: 'Agent', value: 'runner\\_1', inline: true },
        ])
        assert.equal(embed.color, 0xe53935)
    })

    it('accepts every documented Pipelines event', async () => {
        const buildEvents: Record<string, string> = {
            'build.scheduled': 'scheduled',
            'build.running': 'running',
            'build.failing': 'failing',
            'build.finished': 'passed',
            'build.skipped': 'skipped',
        }
        for (const [event, state] of Object.entries(buildEvents)) {
            const result = await Tester.testWithBody(
                Buildkite,
                { event, build: { ...build, state, finished_at: '2026-07-27T14:23:00Z' }, pipeline, sender },
                { 'x-buildkite-event': event },
            )
            assert.notEqual(result, null, event)
        }

        const jobEvents: Record<string, string> = {
            'job.scheduled': 'scheduled',
            'job.started': 'running',
            'job.finished': 'passed',
            'job.activated': 'unblocked',
            'job.promised_exit_status': 'running',
        }
        for (const [event, state] of Object.entries(jobEvents)) {
            const result = await Tester.testWithBody(
                Buildkite,
                {
                    event,
                    job: {
                        name: 'Test suite',
                        state,
                        promised_exit_status: event === 'job.promised_exit_status' ? 1 : undefined,
                    },
                    build,
                    pipeline,
                    sender,
                },
                { 'x-buildkite-event': event },
            )
            assert.notEqual(result, null, event)
        }

        const agentEvents: Record<string, string> = {
            'agent.connected': 'connected',
            'agent.lost': 'lost',
            'agent.disconnected': 'disconnected',
            'agent.stopping': 'stopping',
            'agent.stopped': 'stopped',
            'agent.blocked': 'never_connected',
        }
        for (const [event, connectionState] of Object.entries(agentEvents)) {
            const result = await Tester.testWithBody(
                Buildkite,
                {
                    event,
                    agent: { name: 'runner-1', connection_state: connectionState },
                    blocked_ip: event === 'agent.blocked' ? '203.0.113.10' : undefined,
                    sender,
                },
                { 'x-buildkite-event': event },
            )
            assert.notEqual(result, null, event)
        }
    })

    it('formats agent, blocked registration, ping, package, and the documented Test Engine alarm event', async () => {
        const agentResult = await Tester.testWithBody(Buildkite, {
            event: 'agent.blocked',
            agent: {
                name: 'runner_1',
                connection_state: 'never_connected',
                hostname: 'ci-host',
                queue: 'default',
                version: '3.99.0',
                web_url: 'https://buildkite.com/organizations/acme-inc/clusters/cluster/queues/queue/agents/agent',
            },
            blocked_ip: '203.0.113.10',
            cluster_token: { description: 'Production agents' },
            sender,
        })
        assert.equal(agentResult!.embeds![0].title, 'Agent blocked: runner\\_1')
        assert.deepEqual(agentResult!.embeds![0].fields, [
            { name: 'State', value: 'Never connected', inline: true },
            { name: 'Hostname', value: 'ci-host', inline: true },
            { name: 'Queue', value: 'default', inline: true },
            { name: 'Version', value: '3.99.0', inline: true },
            { name: 'Blocked IP', value: '203.0.113.10', inline: true },
        ])

        const tokenResult = await Tester.testWithBody(Buildkite, {
            event: 'cluster_token.registration_blocked',
            blocked_ip: '203.0.113.11',
            cluster_token: { description: 'Production **agents**' },
            sender,
        })
        assert.equal(tokenResult!.embeds![0].title, 'Agent registration blocked')
        assert.deepEqual(tokenResult!.embeds![0].fields, [
            { name: 'Agent token', value: 'Production \\*\\*agents\\*\\*', inline: true },
            { name: 'Blocked IP', value: '203.0.113.11', inline: true },
        ])

        const pingResult = await Tester.testWithBody(Buildkite, {
            event: 'ping',
            service: { provider: 'webhook' },
            organization: { name: 'Acme Inc', slug: 'acme-inc' },
            sender,
        })
        assert.equal(pingResult!.embeds![0].title, 'Buildkite webhook settings updated')
        assert.deepEqual(pingResult!.embeds![0].fields, [{ name: 'Organization', value: 'Acme Inc', inline: true }])

        const packageResult = await Tester.testWithBody(Buildkite, {
            event: 'package.created',
            package: {
                name: 'banana',
                web_url: 'https://buildkite.com/organizations/acme-inc/packages/registries/my-registry/packages/pkg-1',
                organization: { slug: 'acme-inc' },
                registry: { slug: 'my-registry' },
            },
            sender,
        })
        assert.equal(packageResult!.embeds![0].title, 'Package created: banana')
        assert.deepEqual(packageResult!.embeds![0].fields, [
            { name: 'Registry', value: 'my-registry', inline: true },
            { name: 'Organization', value: 'acme-inc', inline: true },
        ])

        const workflowResult = await Tester.testWithBody(Buildkite, {
            event: 'workflow.alarm',
            subject: {
                type: 'test',
                test_full_name: 'Retries **forever**',
                test_location: './spec/retry_spec.rb:22',
                test_url: 'https://buildkite.com/organizations/acme-inc/analytics/suites/tests/test-id',
            },
            workflow_event: { type: 'transition_count' },
            workflow_id: '0198a11d-9486-7ac5-a87a-d55d2642cd3f',
            workflow_url: 'https://buildkite.com/organizations/acme-inc/analytics/suites/workflows/workflow-id',
        })
        assert.equal(workflowResult!.embeds![0].title, 'Workflow alarm: Retries \\*\\*forever\\*\\*')
        assert.deepEqual(workflowResult!.embeds![0].fields, [
            { name: 'Monitor', value: 'Transition count', inline: true },
            { name: 'Location', value: './spec/retry\\_spec.rb:22', inline: false },
        ])
    })

    it('accepts future event families generically and only links trusted Buildkite URLs', async () => {
        const result = await Tester.testWithBody(
            Buildkite,
            {
                event: 'pipeline.archived',
                web_url: 'https://evil.example/phishing',
                sender: { name: 'Future **sender**' },
            },
            { 'x-buildkite-event': 'pipeline.archived' },
        )
        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'Pipeline archived')
        assert.equal(result!.embeds![0].url, undefined)
        assert.deepEqual(result!.embeds![0].author, { name: 'Future \\*\\*sender\\*\\*' })

        const allowed = await Tester.testWithBody(Buildkite, {
            event: 'pipeline.archived',
            web_url: 'https://api.buildkite.com/v2/organizations/acme-inc/pipelines/my-pipeline',
            sender: 'Webhook creator',
        })
        assert.equal(
            allowed!.embeds![0].url,
            'https://api.buildkite.com/v2/organizations/acme-inc/pipelines/my-pipeline',
        )
        assert.deepEqual(allowed!.embeds![0].author, { name: 'Webhook creator' })

        for (const webUrl of [
            'http://buildkite.com/acme-inc/my-pipeline',
            'https://buildkite.com.evil.example/acme-inc/my-pipeline',
            'https://buildkite.com@evil.example/acme-inc/my-pipeline',
        ]) {
            const unsafe = await Tester.testWithBody(Buildkite, {
                event: 'pipeline.archived',
                web_url: webUrl,
            })
            assert.equal(unsafe!.embeds![0].url, undefined, webUrl)
        }
    })

    it('rejects malformed envelopes, missing family objects, and mismatched event headers', async () => {
        for (const body of [
            null,
            {},
            { event: '' },
            { event: 'Build.Finished' },
            { event: 'build.finished', build, sender },
            { event: 'build.finished', build: { ...build, number: 0 }, pipeline, sender },
            { event: 'job.started', build, pipeline, sender },
            { event: 'agent.connected', sender },
            { event: 'package.created', sender },
            { event: 'workflow.alarm' },
        ]) {
            assert.equal(await Tester.testWithBody(Buildkite, body), null)
        }

        assert.equal(
            await Tester.testWithBody(
                Buildkite,
                { event: 'build.running', build, pipeline, sender },
                { 'x-buildkite-event': 'build.finished' },
            ),
            null,
        )
        assert.equal(
            await Tester.testWithBody(
                Buildkite,
                { event: 'build.running', build, pipeline, sender },
                { 'x-buildkite-event': '' },
            ),
            null,
        )
    })

    it('stays within Discord limits for long untrusted values', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const result = await Tester.testWithBody(Buildkite, {
            event: 'job.promised_exit_status',
            promised_exit_status_reason: longText,
            job: {
                id: 'job-id',
                type: 'script',
                name: longText,
                state: 'running',
                promised_exit_status: 1,
                agent: { name: longText },
                web_url: `https://buildkite.com/${'😀'.repeat(500)}`,
            },
            build: { ...build, branch: longText, message: longText },
            pipeline: { ...pipeline, name: longText },
            sender: { name: longText },
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds![0].color, 0xe53935)

        const embed = result!.embeds![0]
        assert.ok((embed.title?.length ?? 0) <= 256)
        assert.ok((embed.description?.length ?? 0) <= 4096)
        assert.ok((embed.author?.name.length ?? 0) <= 256)
        assert.ok((embed.fields?.length ?? 0) <= 25)
        for (const field of embed.fields ?? []) {
            assert.ok(field.name.length <= 256)
            assert.ok(field.value.length <= 1024)
        }
        const aggregateLength =
            (embed.title?.length ?? 0) +
            (embed.description?.length ?? 0) +
            (embed.author?.name.length ?? 0) +
            (embed.footer?.text.length ?? 0) +
            (embed.fields ?? []).reduce((total, field) => total + field.name.length + field.value.length, 0)
        assert.ok(aggregateLength <= 6000)
        assert.equal(aggregateLength, 6000)
        assert.deepEqual(validateDiscordPayload(result!), [])
    })
})
