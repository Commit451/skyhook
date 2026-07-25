import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AzureDevOps } from '../../src/provider/AzureDevOps.ts'
import { Tester } from '../Tester.ts'

describe('/POST azure', () => {
    it('git.push', async () => {
        const res = await Tester.test(new AzureDevOps(), 'azure.json', null)
        assert.notStrictEqual(res, null)
        assert.ok(Array.isArray(res!.embeds))
        assert.strictEqual(res!.embeds.length, 1)
    })

    const pullRequestCases = [
        ['git.pullrequest.created', 'Pull Request from Ada Lovelace'],
        ['git.pullrequest.merged', 'Pull Request Merge Commit from Ada Lovelace'],
        ['git.pullrequest.updated', 'Pull Request Updated by Ada Lovelace'],
    ] as const

    for (const [eventType, fieldName] of pullRequestCases) {
        it(`preserves the ${eventType} pull-request payload`, async () => {
            const res = await Tester.testWithBody(new AzureDevOps(), {
                eventType,
                message: { markdown: '**Pull request event**' },
                resource: {
                    title: 'Fix webhook formatting',
                    description: 'Preserve the existing Discord payload.',
                    createdBy: {
                        displayName: 'Ada Lovelace',
                        imageUrl: 'https://example.com/ada.png',
                    },
                    repository: { remoteUrl: 'https://example.com/project/repository' },
                },
            })

            assert.deepEqual(res, {
                embeds: [
                    {
                        author: {
                            name: 'Ada Lovelace',
                            icon_url: 'https://example.com/ada.png',
                        },
                        fields: [
                            {
                                name: fieldName,
                                value: '([`Fix webhook formatting`](https://example.com/project/repository)) Preserve the existing Discord payload.',
                                inline: false,
                            },
                        ],
                        title: '**Pull request event**',
                        footer: {
                            text: 'Powered by skyhookapi.com',
                            icon_url: 'https://skyhookapi.com/images/skyhook-tiny.png',
                        },
                        color: 0x68217a,
                    },
                ],
            })
        })
    }
})
