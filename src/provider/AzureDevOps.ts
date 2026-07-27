import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { defineEventProvider, type ProviderMapper } from './Provider.ts'

const minimalHandler: ProviderMapper = ({ body }, output) => {
    output.addEmbed(minimalMessage(body))
}

/**
 * https://learn.microsoft.com/en-us/azure/devops/service-hooks/services/webhooks?view=azure-devops
 */
export const AzureDevOps = defineEventProvider({
    path: 'azure',
    name: 'Azure DevOps',
    example: { body: 'azure/azure.json' },
    defaults: { embedColor: 0x68217a },
    event: 'eventType',
    handlers: {
        'git.push'({ body }, output) {
            const fields: EmbedField[] = body.resource.commits.map((commit: { commitId: string; comment: string }) => ({
                name: `Commit from ${body.resource.pushedBy.displayName}`,
                value: `([\`${commit.commitId.substring(0, 7)}\`](${body.resource.repository.remoteUrl}/commit/${commit.commitId})) ${commit.comment}`,
                inline: false,
            }))
            output.addEmbed(
                minimalMessage(body, {
                    fields,
                    author: {
                        name: body.resource.pushedBy.displayName,
                        icon_url: body.resource.pushedBy.imageUrl,
                    },
                }),
            )
        },
        'tfvc.checkin'({ body }, output) {
            output.addEmbed(
                minimalMessage(body, {
                    fields: [
                        {
                            name: `Check in from ${body.resource.checkedInBy.displayName}`,
                            value: `([\`${body.resource.changesetId}\`](${body.resource.url})) ${body.resource.comment}`,
                            inline: false,
                        },
                    ],
                }),
            )
        },
        'git.pullrequest.created': pullRequestHandler('Pull Request from '),
        'git.pullrequest.merged': pullRequestHandler('Pull Request Merge Commit from '),
        'git.pullrequest.updated': pullRequestHandler('Pull Request Updated by '),
        'workitem.commented': minimalHandler,
        'workitem.created': minimalHandler,
        'workitem.deleted': minimalHandler,
        'workitem.restored': minimalHandler,
        'workitem.updated': minimalHandler,
        'build.complete': minimalHandler,
        'ms.vss-release.release-created-event': minimalHandler,
        'ms.vss-release.release-abandoned-event': minimalHandler,
        'ms.vss-release.deployment-approval-completed': minimalHandler,
        'ms.vss-release.deployment-approval-pending-event': minimalHandler,
        'ms.vss-release.deployment-completed-event': minimalHandler,
        'ms.vss-release.deployment-started-event': minimalHandler,
        'ms.vss-release.deplyoment-started-event': minimalHandler,
    },
})

function pullRequestHandler(fieldLabel: string): ProviderMapper {
    return ({ body }, output) => {
        output.addEmbed(
            minimalMessage(body, {
                author: {
                    name: body.resource.createdBy.displayName,
                    icon_url: body.resource.createdBy.imageUrl,
                },
                fields: [
                    {
                        name: fieldLabel + body.resource.createdBy.displayName,
                        value: `([\`${body.resource.title}\`](${body.resource.repository.remoteUrl})) ${body.resource.description}`,
                        inline: false,
                    },
                ],
            }),
        )
    }
}

function minimalMessage(body: Record<string, any>, embed: Embed = {}): Embed {
    const markdown = String(body.message.markdown)
    return {
        ...embed,
        title: markdown.length > 256 ? (body.resource.title ?? markdown.substring(0, 256)) : markdown,
    }
}
