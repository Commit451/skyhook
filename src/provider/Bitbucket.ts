import type { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi.ts'
import { MarkdownUtil } from '../util/MarkdownUtil.ts'
import { defineEventProvider, type ProviderMapper } from './Provider.ts'

const BASE_LINK = 'https://bitbucket.org/'

/**
 * https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/
 */
export const BitBucket = defineEventProvider({
    path: 'bitbucket',
    name: 'BitBucket',
    example: {
        body: 'bitbucket/bitbucket.json',
        headers: 'bitbucket/bitbucket.headers.json',
    },
    defaults: { embedColor: 0x205081 },
    event: ({ headers }) => headers.get('x-event-key'),
    handlers: {
        'repo:push': repoPush,
        'repo:fork': embedHandler(repoFork),
        'repo:updated': embedHandler(repoUpdated),
        'repo:commit_comment_created': embedHandler(repoCommitComment),
        'repo:commit_status_created': embedHandler((body) => commitStatus(body, false)),
        'repo:commit_status_updated': embedHandler((body) => commitStatus(body, true)),
        'issue:created': embedHandler(issueCreated),
        'issue:updated': embedHandler(issueUpdated),
        'issue:comment_created': embedHandler(issueCommentCreated),
        'pullrequest:created': embedHandler((body) => pullRequestWithDetails(body, 'Pull request opened')),
        'pullrequest:updated': embedHandler((body) => pullRequestWithDetails(body, 'Updated pull request')),
        'pullrequest:approved': coloredPullRequestHandler('Approved pull request', 0x2db83d),
        'pullrequest:unapproved': embedHandler((body) => pullRequest(body, 'Removed approval for pull request')),
        'pullrequest:fulfilled': embedHandler((body) => pullRequest(body, 'Merged pull request')),
        'pullrequest:rejected': embedHandler(pullRequestRejected),
        'pullrequest:comment_created': embedHandler((body) => pullRequestComment(body, 'New comment on pull request')),
        'pullrequest:comment_updated': embedHandler((body) =>
            pullRequestComment(body, 'Updated comment on pull request'),
        ),
        'pullrequest:comment_deleted': embedHandler((body) =>
            pullRequestComment(body, 'Deleted comment on pull request'),
        ),
        'pullrequest:changes_request_created': coloredPullRequestHandler(
            'Changes requested for pull request',
            0xffa500,
        ),
        'pullrequest:changes_request_removed': embedHandler((body) =>
            pullRequest(body, 'Removed changes requested for pull request'),
        ),
    },
})

function embedHandler(formatter: (body: Record<string, any>) => Embed): ProviderMapper {
    return ({ body }, output) => output.addEmbed(formatter(body))
}

function coloredPullRequestHandler(title: string, color: number): ProviderMapper {
    return ({ body }, output) => {
        output.setEmbedColor(color)
        output.addEmbed(pullRequest(body, title))
    }
}

function repoPush({ body }: { body: Record<string, any> }, output: { addEmbed(embed: Embed): void }): void {
    if (body.push?.changes == null) return
    for (const change of body.push.changes.slice(0, 4)) {
        const embed: Embed = { author: author(body) }
        if (change.new == null && change.old.type === 'branch') {
            embed.title = `[${body.repository.full_name}] Branch deleted: ${change.old.name}`
        } else if (change.old == null && change.new.type === 'branch') {
            embed.title = `[${body.repository.full_name}] New branch created: ${change.new.name}`
            embed.url = change.new.links.html.href
        } else if (change.old == null && change.new.type === 'tag') {
            embed.title = `[${body.repository.full_name}] New tag created: ${change.new.name}`
            embed.url = change.new.links.html.href
        } else if (change.new == null && change.old.type === 'tag') {
            embed.title = `[${body.repository.full_name}] Tag deleted: ${change.old.name}`
        } else {
            const commits = change.commits
            const fields: EmbedField[] = []
            let title = `[${body.repository.name}]:${change.new.name} `
            if (commits != null) {
                title += `${commits.length} commit${commits.length > 1 ? 's' : ''}`
                for (let index = commits.length - 1; index >= 0; index--) {
                    const commit = commits[index]
                    const message = formatLargeString(commit.message)
                    const commitAuthor = commit.author.user?.display_name ?? 'Unknown'
                    fields.push({
                        name: `Commit from ${commitAuthor}`,
                        value: `([\`${commit.hash.substring(0, 7)}\`](${commit.links.html.href})) ${message.replace(/\n/g, ' ').replace(/\r/g, ' ')}`,
                    })
                }
            }
            embed.title = title
            embed.url = change.links.html.href
            embed.fields = fields
        }
        output.addEmbed(embed)
    }
}

function repoFork(body: Record<string, any>): Embed {
    return {
        author: author(body),
        description: `Created a [\`fork\`](${BASE_LINK}${body.fork.full_name}) of [\`${body.repository.name}\`](${BASE_LINK}${body.repository.full_name})`,
    }
}

function repoUpdated(body: Record<string, any>): Embed {
    const changes: string[] = []
    for (const property of ['name', 'website', 'language', 'description']) {
        if (body.changes[property] !== undefined) {
            const label = titleCase(property)
            changes.push(`**${label}:** "${body.changes[property].old}" -> "${body.changes[property].new}"`)
        }
    }
    return {
        author: author(body),
        title: `[${body.repository.full_name}] General information updated`,
        url: BASE_LINK + body.repository.full_name,
        description: changes.join('\n'),
    }
}

function repoCommitComment(body: Record<string, any>): Embed {
    return {
        author: author(body),
        title: `[${body.repository.full_name}] New comment on commit \`${body.commit.hash.substring(0, 7)}\``,
        description: formatHtmlText(body.comment.content.html),
        url: `${BASE_LINK}${body.repository.full_name}/commits/${body.commit.hash}`,
    }
}

function commitStatus(body: Record<string, any>, includeAuthor: boolean): Embed {
    return {
        ...(includeAuthor ? { author: author(body) } : {}),
        title: body.commit_status.name,
        description: `**State:** ${body.commit_status.state}\n${body.commit_status.description}`,
        url: body.commit_status.url,
    }
}

function issueCreated(body: Record<string, any>): Embed {
    const embed: Embed = {
        author: author(body),
        title: `[${body.repository.full_name}] Issue opened: #${body.issue.id} ${body.issue.title}`,
        url: issueUrl(body),
    }
    const states: string[] = []
    if (body.issue.assignee?.display_name != null) {
        states.push(`**Assignee:** [\`${body.issue.assignee.display_name}\`](${body.issue.assignee.links.html.href})`)
    }
    states.push(`**State:** \`${titleCase(body.issue.state)}\``)
    states.push(`**Kind:** \`${titleCase(body.issue.kind)}\``)
    states.push(`**Priority:** \`${titleCase(body.issue.priority)}\``)
    for (const property of ['component', 'milestone', 'version']) {
        if (body.issue[property]?.name != null) {
            states.push(`**${titleCase(property)}:** \`${titleCase(body.issue[property].name)}\``)
        }
    }
    if (body.issue.content.raw) {
        states.push(`**Content:**\n${MarkdownUtil._formatMarkdown(formatLargeString(body.issue.content.raw), embed)}`)
    }
    embed.description = states.join('\n')
    return embed
}

function issueUpdated(body: Record<string, any>): Embed {
    const embed: Embed = {
        author: author(body),
        title: `[${body.repository.full_name}] Issue updated: #${body.issue.id} ${body.issue.title}`,
        url: issueUrl(body),
    }
    const changes: string[] = []
    if (body.changes !== undefined) {
        for (const label of ['Assignee', 'Responsible']) {
            const actor = body.changes[label.toLowerCase()]
            if (actor == null) continue
            const oldActor =
                actor.old?.username != null
                    ? `[\`${actor.old.display_name}\`](${actor.old.links.html.href})`
                    : '`Unassigned`'
            const newActor =
                actor.new?.username != null
                    ? `[\`${actor.new.display_name}\`](${actor.new.links.html.href})`
                    : '`Unassigned`'
            if (oldActor !== '`Unassigned`' || newActor !== '`Unassigned`') {
                changes.push(`**${label}:** ${oldActor} 🡪 ${newActor}`)
            }
        }
        for (const label of ['Kind', 'Priority', 'Status', 'Component', 'Milestone', 'Version']) {
            const property = body.changes[label.toLowerCase()]
            if (property !== undefined) {
                changes.push(`**${label}:** \`${titleCase(property.old)}\` 🡪 \`${titleCase(property.new)}\``)
            }
        }
        const content = body.changes.content
        if (content !== undefined) {
            changes.push(`**New Content:** \n${MarkdownUtil._formatMarkdown(formatLargeString(content.new), embed)}`)
        }
    }
    embed.description = changes.join('\n')
    return embed
}

function issueCommentCreated(body: Record<string, any>): Embed {
    const embed: Embed = {
        author: author(body),
        title: `[${body.repository.full_name}] New comment on issue #${body.issue.id}: ${body.issue.title}`,
        url: issueUrl(body),
    }
    embed.description = MarkdownUtil._formatMarkdown(formatLargeString(body.comment.content.raw), embed)
    return embed
}

function pullRequestWithDetails(body: Record<string, any>, title: string): Embed {
    return {
        ...pullRequest(body, title),
        description: body.pullrequest.description,
        fields: [pullRequestField(body)],
    }
}

function pullRequest(body: Record<string, any>, title: string): Embed {
    return {
        author: author(body),
        title: `[${body.repository.full_name}] ${title}: #${body.pullrequest.id} ${body.pullrequest.title}`,
        url: pullRequestUrl(body),
    }
}

function pullRequestRejected(body: Record<string, any>): Embed {
    return {
        ...pullRequest(body, 'Rejected pull request'),
        description: body.pullrequest.reason === undefined ? '' : formatHtmlText(body.pullrequest.reason),
    }
}

function pullRequestComment(body: Record<string, any>, title: string): Embed {
    return {
        ...pullRequest(body, title),
        description: formatHtmlText(body.comment.content.html),
    }
}

function author(body: Record<string, any>): EmbedAuthor {
    const result: EmbedAuthor = { name: body.actor.display_name }
    if (body.actor.links === undefined) {
        result.icon_url = 'http://i0.wp.com/avatar-cdn.atlassian.com/default/96.png'
        result.url = ''
    } else {
        result.icon_url = body.actor.links.avatar.href
        result.url = BASE_LINK + body.actor.username
    }
    return result
}

function pullRequestUrl(body: Record<string, any>): string {
    return `${BASE_LINK}${body.repository.full_name}/pull-requests/${body.pullrequest.id}`
}

function pullRequestField(body: Record<string, any>): EmbedField {
    return {
        name: body.pullrequest.title,
        value: `**Destination branch:** ${body.pullrequest.destination.branch.name}\n**State:** ${body.pullrequest.state}\n`,
    }
}

function issueUrl(body: Record<string, any>): string {
    return `${BASE_LINK}${body.repository.full_name}/issues/${body.issue.id}`
}

function formatLargeString(value: string, limit = 256): string {
    return value.length > limit ? value.substring(0, limit - 1) + '\u2026' : value
}

function formatHtmlText(html: string): string {
    return formatLargeString(html.replace(/<.*?>/g, ''), 1024)
}

function titleCase(value: string | null, ifNull = 'None'): string {
    if (value == null) return ifNull
    return value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
