import type { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi.ts'
import { defineEventProvider, type ProviderMapper } from './Provider.ts'

const BITBUCKET_ICON = 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png'

/**
 * https://developer.atlassian.com/server/bitbucket/how-tos/webhooks/
 */
export const BitBucketServer = defineEventProvider({
    path: 'bitbucketserver',
    name: 'BitBucketServer',
    example: {
        body: 'bitbucketserver/bitbucketserver.json',
        headers: 'bitbucketserver/bitbucketserver.headers.json',
    },
    defaults: { embedColor: 0x205081 },
    event: ({ headers }) => headers.get('x-event-key'),
    handlers: {
        'diagnostics:ping': ({ body }, output) => {
            output.addEmbed({
                title: 'Test Connection',
                description: 'You have successfully configured Skyhook with your BitBucket Server instance.',
                fields: [{ name: 'Test', value: body.test }],
            })
        },
        'repo:refs_changed': embedHandler(repoRefsChanged),
        'repo:modified': embedHandler(repoModified),
        'repo:forked': embedHandler((body) => ({
            author: author(body),
            description: 'A new [`fork`] has been created.',
        })),
        'repo:comment:added': embedHandler((body) => commitComment(body, 'New comment on commit')),
        'repo:comment:edited': embedHandler((body) => commitComment(body, 'Comment edited on commit')),
        'repo:comment:deleted': embedHandler((body) => commitComment(body, 'Comment deleted on commit')),
        'pr:opened': embedHandler((body) => pullRequest(body, 'Pull request opened')),
        'pr:from_ref_updated': embedHandler((body) => pullRequest(body, 'Pull request updated')),
        'pr:modified': embedHandler((body) => pullRequest(body, 'Pull request modified')),
        'pr:reviewer:updated': embedHandler((body) => pullRequest(body, 'New reviewers for pull request')),
        'pr:reviewer:approved': embedHandler((body) => pullRequest(body, 'Pull request approved')),
        'pr:reviewer:unapproved': embedHandler((body) => pullRequest(body, 'Removed approval for pull request')),
        'pr:reviewer:needs_work': embedHandler((body) => pullRequest(body, 'Pull request needs work')),
        'pr:merged': embedHandler((body) => pullRequest(body, 'Pull request merged')),
        'pr:declined': embedHandler((body) => pullRequest(body, 'Pull request declined')),
        'pr:deleted': embedHandler((body) => pullRequest(body, 'Deleted pull request')),
        'pr:comment:added': embedHandler((body) => pullRequestComment(body, 'New comment on pull request')),
        'pr:comment:edited': embedHandler((body) => pullRequestComment(body, 'Updated comment on pull request')),
        'pr:comment:deleted': embedHandler((body) => pullRequestComment(body, 'Deleted comment on pull request')),
        'mirror:repo_synchronized': embedHandler((body) => ({
            title: `[${body.repository.name}] Mirror Synchronized`,
        })),
    },
})

function embedHandler(formatter: (body: Record<string, any>) => Embed): ProviderMapper {
    return ({ body }, output) => output.addEmbed(formatter(body))
}

function repoRefsChanged(body: Record<string, any>): Embed {
    return {
        author: author(body),
        title: `[${body.repository.name}] New commit`,
        ...(typeof body.repository.description === 'string' ? { description: body.repository.description } : {}),
        url: repoUrl(body),
        fields: repoChangeFields(body),
    }
}

function repoModified(body: Record<string, any>): Embed {
    return {
        author: author(body),
        title: `[${body.old.name}] Repository has been updated`,
        url: `${baseLink(body)}/projects/${body.new.project.key}/repos/${body.new.slug}/browse`,
    }
}

function pullRequest(body: Record<string, any>, title: string): Embed {
    return {
        author: author(body),
        title: `[${body.pullRequest.toRef.repository.name}] ${title}: #${body.pullRequest.id} ${body.pullRequest.title}`,
        description: body.pullRequest.description,
        url: pullRequestUrl(body),
        fields: pullRequestFields(body),
    }
}

function pullRequestComment(body: Record<string, any>, title: string): Embed {
    return {
        author: author(body),
        title: `[${body.pullRequest.toRef.repository.name}] ${title}: #${body.pullRequest.id} ${body.pullRequest.title}`,
        description: body.comment.text,
        url: pullRequestUrl(body),
    }
}

function commitComment(body: Record<string, any>, title: string): Embed {
    return {
        author: author(body),
        title: `[${body.repository.name}] ${title} ${body.commit.slice(0, 10)}`,
        description: body.comment.text,
        url: `${baseLink(body)}/projects/${body.repository.project.key}/repos/${body.repository.slug}/commits/${body.commit}`,
    }
}

function author(body: Record<string, any>): EmbedAuthor {
    return { name: body.actor.displayName, icon_url: BITBUCKET_ICON }
}

function pullRequestUrl(body: Record<string, any>): string {
    const repository = body.pullRequest.fromRef.repository
    return `${baseLink(body)}/projects/${repository.project.key}/repos/${repository.slug}/pull-requests/${body.pullRequest.id}/overview`
}

function pullRequestFields(body: Record<string, any>): EmbedField[] {
    const fields: EmbedField[] = [
        {
            name: 'From --> To',
            value: `**Source branch:** ${body.pullRequest.fromRef.displayId} \n **Destination branch:** ${body.pullRequest.toRef.displayId} \n **State:** ${body.pullRequest.state}`,
        },
    ]
    for (const reviewer of body.pullRequest.reviewers.slice(0, 18)) {
        fields.push({ name: 'Reviewer', value: reviewer.user.displayName })
    }
    return fields
}

function repoUrl(body: Record<string, any>): string {
    return `${baseLink(body)}/projects/${body.repository.project.key}/repos/${body.repository.slug}/browse`
}

function repoChangeFields(body: Record<string, any>): EmbedField[] {
    return body.changes.slice(0, 18).map((change: Record<string, any>) => ({
        name: 'Change',
        value: `**Branch:** ${change.ref.displayId} \n **Old Hash:** ${change.fromHash.slice(0, 10)} \n **New Hash:** ${change.toHash.slice(0, 10)} \n **Type:** ${change.type}`,
    }))
}

function baseLink(body: Record<string, any>): string {
    const actorLink = body.actor.links.self[0].href
    return actorLink.substring(0, actorLink.indexOf('/user'))
}
