import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Zendesk } from '../../src/provider/Zendesk.ts'
import { Tester } from '../Tester.ts'

describe('/POST zendesk', () => {
    it('formats the documented ticket-created event payload', async () => {
        const result = await Tester.test(new Zendesk(), 'zendesk.json')
        assert.notEqual(result, null)
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
        assert.equal(result!.embeds?.length, 1)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Ticket created: ticketinfo\\_2294a6e9ece2')
        assert.equal(embed.description, 'ticket\\_info\\_desc\\_2294a6e9ece2')
        assert.equal(embed.timestamp, '2025-01-08T10:12:07.672Z')
        assert.equal(embed.color, 0x03363d)
        assert.deepEqual(embed.fields, [
            { name: 'Ticket ID', value: '5158', inline: true },
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Priority', value: 'Low', inline: true },
            { name: 'Type', value: 'Task', inline: true },
            { name: 'Channel', value: 'Web service', inline: true },
        ])
    })

    it('summarizes ticket field changes', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 17839070,
            detail: {
                id: '1244',
                description: 'Incident details that should not repeat on every change.',
                priority: 'HIGH',
                status: 'OPEN',
                subject: 'Login failures',
                type: 'INCIDENT',
                via: { channel: 'web_service' },
            },
            event: { current: 'OPEN', previous: 'NEW' },
            id: 'ca74d97a-ae8c-40e9-b8a8-37e3ae0afedf',
            subject: 'zen:ticket:1244',
            time: '2025-01-10T17:27:48.105316520Z',
            type: 'zen:event-type:ticket.status_changed',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Ticket status changed: Login failures')
        assert.equal(embed.description, undefined)
        assert.equal(embed.timestamp, '2025-01-10T17:27:48.105Z')
        assert.deepEqual(embed.fields, [
            { name: 'Change', value: 'New → Open', inline: false },
            { name: 'Ticket ID', value: '1244', inline: true },
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Priority', value: 'High', inline: true },
            { name: 'Type', value: 'Incident', inline: true },
            { name: 'Channel', value: 'Web service', inline: true },
        ])
    })

    it('formats ticket comments with author and visibility', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 18501212,
            detail: {
                id: '342757',
                status: 'OPEN',
                subject: 'Conversation with Visitor 49333687',
                via: { channel: 'chat' },
            },
            event: {
                comment: {
                    author: { id: '8659716080510', is_staff: false, name: 'Visitor 49333687' },
                    body: 'I need help with **billing** and _refunds_.',
                    id: '8659716087550',
                    is_public: false,
                },
            },
            id: '2ba2a985-7d94-4a3f-92be-cd330679b6fa',
            subject: 'zen:ticket:342757',
            time: '2025-01-15T06:13:26.962242814Z',
            type: 'zen:event-type:ticket.comment_added',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Ticket comment added: Conversation with Visitor 49333687')
        assert.equal(embed.description, 'I need help with \\*\\*billing\\*\\* and \\_refunds\\_.')
        assert.deepEqual(embed.author, { name: 'Visitor 49333687' })
        assert.deepEqual(embed.fields, [
            { name: 'Visibility', value: 'Internal note', inline: true },
            { name: 'Ticket ID', value: '342757', inline: true },
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Channel', value: 'Chat', inline: true },
        ])
    })

    it('handles standard event domains and future event types generically', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 123456,
            detail: {
                created_at: '2025-01-08T10:12:07Z',
                group_id: '42',
                id: '99',
                name: 'Acme **Support**',
            },
            event: {},
            id: 'event-id',
            subject: 'zen:organization:99',
            time: '2025-01-08T10:12:07Z',
            type: 'zen:event-type:organization.created',
            zendesk_event_version: '2022-06-20',
        })
        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'Organization created: Acme \\*\\*Support\\*\\*')
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Organization ID', value: '99', inline: true },
            { name: 'Group ID', value: '42', inline: true },
        ])

        const futureResult = await Tester.testWithBody(new Zendesk(), {
            account_id: 123456,
            detail: { id: 'abc' },
            event: { current: true, previous: false },
            id: 'future-event-id',
            subject: 'zen:custom_resource:abc',
            time: '2025-01-08T10:12:07Z',
            type: 'zen:event-type:custom_resource.enabled_changed',
            zendesk_event_version: '2022-06-20',
        })
        assert.notEqual(futureResult, null)
        assert.equal(futureResult!.embeds![0].title, 'Custom resource enabled changed')
        assert.deepEqual(futureResult!.embeds![0].fields, [
            { name: 'Change', value: 'False → True', inline: false },
            { name: 'Custom resource ID', value: 'abc', inline: true },
        ])
    })

    it('accepts Zendesk event types that use the documented slash delimiter', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 12514403,
            detail: { id: '6596848315901', role: 'END_USER' },
            event: { identity: { id: '42', type: 'email' } },
            id: '6b9bbadf-5725-4e92-bebe-7b71011bf5f1',
            subject: 'zen:user:6596848315901',
            time: '2099-07-04T05:33:18Z',
            type: 'zen:event-type/user.identity_created',
            zendesk_event_version: '2022-06-20',
        })
        assert.notEqual(result, null)
        assert.equal(result!.embeds![0].title, 'User identity created')
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'User ID', value: '6596848315901', inline: true },
            { name: 'Role', value: 'End user', inline: true },
        ])
    })

    it('formats messaging events with the message author and body', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 123456,
            detail: { id: '9876' },
            event: {
                actor: { id: '42', name: 'Ada _Agent_', type: 'agent' },
                conversation_id: 'conversation-id',
                message: { id: 'message-id', body: 'I need **help** _now_.' },
            },
            id: 'messaging-event-id',
            subject: 'zen:ticket:9876',
            time: '2025-01-08T10:12:07Z',
            type: 'zen:event-type:messaging_ticket.message_added',
            zendesk_event_version: '2022-06-20',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.equal(embed.title, 'Messaging ticket message added')
        assert.equal(embed.description, 'I need \\*\\*help\\*\\* \\_now\\_.')
        assert.deepEqual(embed.author, { name: 'Ada \\_Agent\\_' })
        assert.deepEqual(embed.fields, [{ name: 'Messaging ticket ID', value: '9876', inline: true }])
    })

    it('summarizes agent availability state changes', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 2,
            detail: { account_id: '2', agent_id: '10011', version: '3' },
            event: {
                channel: 'support',
                new_state: 'online',
                previous_state: 'offline',
                updated_at: '2023-04-05T23:30:58.642630335Z',
            },
            id: '01GX79ST1QX01C889XV42S2J5T',
            subject: 'zen:agent:10011',
            time: '2023-05-10T23:31:58.642630335Z',
            type: 'zen:event-type:agent.state_changed',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Change', value: 'Offline → Online', inline: false },
            { name: 'Channel', value: 'Support', inline: true },
            { name: 'Agent ID', value: '10011', inline: true },
        ])
    })

    it('accepts the documented account subject for omnichannel configuration events', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 2,
            detail: { account_id: 2 },
            event: { current_value: false, previous_value: true },
            id: '01GX79ST1QX01C889XV42S2J5Z',
            subject: 'zen:account:2',
            time: '2023-05-10T23:31:58.642630335Z',
            type: 'zen:event-type:omnichannel_config.omnichannel_routing_feature_changed',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Change', value: 'True → False', inline: false },
            { name: 'Account ID', value: '2', inline: true },
        ])
    })

    it('summarizes standard list and custom-field changes without dumping nested metadata', async () => {
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 123456,
            detail: { id: '5158', status: 'OPEN', subject: 'Tagged ticket' },
            event: {
                custom_field: { id: '10', title: 'Environment', type: 'text' },
                current: { value: 'Production' },
                previous: { value: 'Staging' },
                tags_added: ['urgent', 'customer_visible'],
                tags_removed: ['triage'],
                meta: { sequence: { id: 'secret-internal-sequence', position: 1 } },
            },
            id: 'event-id',
            subject: 'zen:ticket:5158',
            time: '2025-01-08T10:12:07Z',
            type: 'zen:event-type:ticket.custom_field_changed',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)
        assert.deepEqual(result!.embeds![0].fields, [
            { name: 'Environment', value: 'Staging → Production', inline: false },
            { name: 'Tags added', value: 'urgent, customer visible', inline: false },
            { name: 'Tags removed', value: 'triage', inline: false },
            { name: 'Ticket ID', value: '5158', inline: true },
            { name: 'Status', value: 'Open', inline: true },
        ])
        assert.ok(!JSON.stringify(result).includes('secret-internal-sequence'))
    })

    it('ignores malformed and custom trigger payloads that lack the standard event schema', async () => {
        for (const body of [
            null,
            {},
            { type: 'ticket.created', detail: {}, event: {} },
            { type: 'zen:event-type:ticket.created', detail: {}, event: {} },
            {
                account_id: 123456,
                detail: {},
                event: {},
                id: 'event-id',
                subject: 'zen:user:123',
                time: '2025-01-08T10:12:07Z',
                type: 'zen:event-type:ticket.created',
                zendesk_event_version: '2022-11-06',
            },
            { type: 'zen:event-type:ticket.created', detail: null, event: {} },
            { ticket: { id: 123, subject: 'Custom trigger payload' } },
        ]) {
            const result = await Tester.testWithBody(new Zendesk(), body)
            assert.equal(result, null)
        }
    })

    it('rejects malformed envelope timestamps and omits unsafe integer identifiers', async () => {
        const body = {
            account_id: 123456,
            detail: {
                id: Number('820982911946154508'),
                name: 'Unsafe identifiers',
            },
            event: {
                current: Number('820982911946154508'),
                previous: Number('820982911946154507'),
            },
            id: 'event-id',
            subject: 'zen:organization:820982911946154508',
            time: '2025-02-28T00:00:00.000Z',
            type: 'zen:event-type:organization.created',
            zendesk_event_version: '2022-06-20',
        }
        const result = await Tester.testWithBody(new Zendesk(), body)
        assert.notEqual(result, null)
        assert.deepEqual(result!.embeds![0].fields, [])

        const invalidTimestampResult = await Tester.testWithBody(new Zendesk(), {
            ...body,
            time: '2025-02-31T00:00:00.000Z',
        })
        assert.equal(invalidTimestampResult, null)
    })

    it('stays within Discord embed limits for untrusted payload text', async () => {
        const longText = '@everyone [click](https://evil.example) ' + 'x'.repeat(7000)
        const result = await Tester.testWithBody(new Zendesk(), {
            account_id: 123456,
            detail: {
                description: longText,
                id: '5158',
                priority: longText,
                status: longText,
                subject: longText,
                type: longText,
                via: { channel: longText },
            },
            event: { current: longText, previous: longText },
            id: 'event-id',
            subject: 'zen:ticket:5158',
            time: '2025-01-08T10:12:07Z',
            type: 'zen:event-type:ticket.description_changed',
            zendesk_event_version: '2022-11-06',
        })
        assert.notEqual(result, null)

        const embed = result!.embeds![0]
        assert.ok((embed.title?.length ?? 0) <= 256)
        assert.ok((embed.description?.length ?? 0) <= 4096)
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
        assert.deepEqual(result!.allowed_mentions, { parse: [] })
    })
})
