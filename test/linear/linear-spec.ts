import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProviderExample } from '../../src/ProviderExamples.ts'
import { Linear } from '../../src/provider/Linear.ts'
import { Tester } from '../Tester.ts'

const envelope = {
    createdAt: '2026-07-24T18:30:00.123Z',
    organizationId: 'dc844923-f9a4-40a3-825c-dea7747e57d6',
    webhookTimestamp: 1784917800123,
    webhookId: '000042e3-d123-4980-b49f-8e140eef9329',
}

describe('/POST linear', () => {
    it('exposes provider metadata', () => {
        const provider = new Linear()

        assert.equal(provider.getName(), 'Linear')
        assert.equal(provider.getPath(), 'linear')
    })

    it('formats the documented comment payload used by example delivery', async () => {
        const example = loadProviderExample('linear')
        const result = await Tester.testWithBody(new Linear(), example.body, example.headers, example.query)
        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.username, 'Linear')
        assert.equal(result!.embeds?.length, 1)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Comment created')
        assert.equal(embed.description, 'Indeed, I think this is definitely an improvement over the previous version.')
        assert.equal(
            embed.url,
            'https://linear.app/issue/LIN-1778/foo-bar#comment-77217de3-fb52-4dad-bb9a-b356beb93de8',
        )
        assert.deepEqual(embed.author, {
            name: 'Linear Orbit',
            url: 'https://linear.app/company/profiles/orbit',
        })
        assert.equal(embed.timestamp, '2020-01-23T12:53:18.084Z')
        assert.equal(embed.color, 0x5e6ad2)
        assert.deepEqual(embed.fields, [])
    })

    it('summarizes issue updates with useful current values and changed fields', async () => {
        const result = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'update',
            actor: {
                name: 'Grace **Hopper**',
                url: 'https://linear.app/acme/profiles/grace',
            },
            data: {
                identifier: 'ENG-42',
                title: 'Fix **login**',
                description: 'Customer cannot **sign in**.',
                state: { name: 'In Progress' },
                assignee: { name: 'Ada _Lovelace_' },
                priority: 2,
                team: { name: 'Platform' },
            },
            type: 'Issue',
            updatedFrom: {
                stateId: 'old-state-id',
                assigneeId: null,
                priority: 4,
                title: 'Old title',
                updatedAt: '2026-07-24T18:00:00.000Z',
            },
            url: 'https://linear.app/acme/issue/ENG-42/fix-login',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Issue updated: ENG-42 — Fix \\*\\*login\\*\\*')
        assert.equal(embed.description, 'Customer cannot \\*\\*sign in\\*\\*.')
        assert.equal(embed.url, 'https://linear.app/acme/issue/ENG-42/fix-login')
        assert.deepEqual(embed.author, {
            name: 'Grace \\*\\*Hopper\\*\\*',
            url: 'https://linear.app/acme/profiles/grace',
        })
        assert.deepEqual(embed.fields, [
            { name: 'State', value: 'In Progress', inline: true },
            { name: 'Assignee', value: 'Ada \\_Lovelace\\_', inline: true },
            { name: 'Priority', value: 'High', inline: true },
            { name: 'Team', value: 'Platform', inline: true },
            { name: 'Updated fields', value: 'State, Assignee, Priority, Title', inline: false },
        ])
    })

    it('handles current and future data-change resource types generically', async () => {
        const result = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'create',
            data: {
                name: 'Q3 **Launch** update',
                body: 'The rollout is at 50% with [details](https://example.com).',
                project: { name: 'Mobile' },
            },
            type: 'InitiativeUpdate',
            url: 'https://linear.app/acme/initiative/launch/updates/123',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Initiative update created: Q3 \\*\\*Launch\\*\\* update')
        assert.equal(embed.description, 'The rollout is at 50% with \\[details\\]\\(https://example.com\\).')
        assert.deepEqual(embed.fields, [{ name: 'Project', value: 'Mobile', inline: true }])

        const removedResult = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'remove',
            data: { identifier: 'ENG-41', title: 'Retired issue' },
            type: 'Issue',
            url: 'https://linear.app/acme/issue/ENG-41/retired-issue',
        })
        assert.equal(removedResult!.embeds![0].title, 'Issue removed: ENG-41 — Retired issue')
    })

    it('formats Issue SLA and OAuth app convenience events', async () => {
        const slaResult = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'breached',
            issueData: {
                identifier: 'SUP-7',
                title: 'Customer cannot check out',
                state: { name: 'Open' },
            },
            type: 'IssueSLA',
            url: 'https://linear.app/acme/issue/SUP-7/customer-cannot-check-out',
        })
        assert.notEqual(slaResult, null)
        assert.equal(slaResult!.embeds![0].title, 'Issue SLA breached: SUP-7 — Customer cannot check out')
        assert.deepEqual(slaResult!.embeds![0].fields, [{ name: 'State', value: 'Open', inline: true }])

        for (const [action, phrase] of [
            ['set', 'set'],
            ['highRisk', 'at high risk'],
        ] as const) {
            const result = await Tester.testWithBody(new Linear(), {
                ...envelope,
                action,
                issueData: { identifier: 'SUP-7', title: 'Customer cannot check out' },
                type: 'IssueSLA',
                url: 'https://linear.app/acme/issue/SUP-7/customer-cannot-check-out',
            })
            assert.equal(result!.embeds![0].title, `Issue SLA ${phrase}: SUP-7 — Customer cannot check out`)
        }

        const revokedResult = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'revoked',
            oauthClientId: 'oauth-client-id',
            type: 'OAuthApp',
            url: 'https://linear.app/settings/api/applications',
        })
        assert.notEqual(revokedResult, null)
        assert.equal(revokedResult!.embeds![0].title, 'OAuth app revoked')
        assert.deepEqual(revokedResult!.embeds![0].fields, [
            { name: 'OAuth client ID', value: 'oauth-client-id', inline: true },
        ])
    })

    it('rejects malformed envelopes and mismatched event headers', async () => {
        for (const body of [
            null,
            {},
            { ...envelope, action: 'create', data: {}, type: 'Issue', createdAt: '2026-02-31T00:00:00.000Z' },
            { ...envelope, action: 'create', type: 'Issue' },
            { ...envelope, action: '', data: {}, type: 'Issue' },
            { ...envelope, action: 'create', data: {}, type: '' },
            { ...envelope, action: 'create', data: {}, type: 'Issue', webhookTimestamp: Number.NaN },
        ]) {
            assert.equal(await Tester.testWithBody(new Linear(), body), null)
        }

        assert.equal(
            await Tester.testWithBody(
                new Linear(),
                { ...envelope, action: 'create', data: {}, type: 'Issue' },
                { 'linear-event': 'Comment' },
            ),
            null,
        )
    })

    it('only links trusted Linear URLs', async () => {
        const result = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'create',
            actor: { name: 'Unsafe actor', url: 'https://evil.example/profile' },
            data: { title: 'Unsafe links' },
            type: 'Document',
            url: 'https://evil.example/phishing',
        })
        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].url, undefined)
        assert.deepEqual(result!.embeds![0].author, { name: 'Unsafe actor' })

        const oversizedUrl = `https://linear.app/${'😀'.repeat(500)}`
        const oversizedResult = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'create',
            actor: { name: 'Actor', url: oversizedUrl },
            data: { title: 'Oversized normalized URLs' },
            type: 'Document',
            url: oversizedUrl,
        })
        assert.equal(oversizedResult!.embeds![0].url, undefined)
        assert.deepEqual(oversizedResult!.embeds![0].author, { name: 'Actor' })
    })

    it('stays within Discord limits for long untrusted values', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const labels = Array.from({ length: 100 }, (_, index) => ({ name: `${index}-${longText}` }))
        const updatedFrom = Object.fromEntries(
            Array.from({ length: 100 }, (_, index) => [`veryLongChangedField${index}${longText}`, 'old']),
        )
        const result = await Tester.testWithBody(new Linear(), {
            ...envelope,
            action: 'update',
            actor: { name: longText },
            data: {
                identifier: longText,
                title: longText,
                description: longText,
                labels,
                state: { name: longText },
            },
            type: 'Issue',
            updatedFrom,
            url: 'https://linear.app/acme/issue/ENG-99/long',
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })

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
    })
})
