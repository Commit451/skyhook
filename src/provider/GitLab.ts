import type { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi.ts'
import { defineEventProvider } from './Provider.ts'

interface Project {
    name: string
    url: string
    branch: string
    commits: any[]
    totalCommitsCount: number
}

/**
 * https://docs.gitlab.com/user/project/integrations/webhook_events/
 */
export const GitLab = defineEventProvider({
    path: 'gitlab',
    name: 'GitLab',
    example: { body: 'gitlab/gitlab.json' },
    defaults: { embedColor: 0xfca326 },
    event: 'object_kind',
    handlers: {
        push({ body }, output) {
            output.addEmbed(pushEvent(body))
        },
        tag_push({ body }, output) {
            output.addEmbed(tagPushEvent(body))
        },
        issue({ body }, output) {
            output.addEmbed(changeEvent(body, 'issue', ISSUE_ACTIONS))
        },
        note({ body }, output) {
            output.addEmbed(noteEvent(body))
        },
        merge_request({ body }, output) {
            output.addEmbed(changeEvent(body, 'merge request', MERGE_REQUEST_ACTIONS))
        },
        wiki_page({ body }, output) {
            output.addEmbed(wikiPageEvent(body))
        },
        pipeline({ body }, output) {
            output.addEmbed({
                title: `Pipeline #${body.object_attributes.id} on ${body.project.name}`,
                url: `${body.project.web_url}/pipelines/${body.object_attributes.id}`,
                author: authorFromBody(body),
                description: `**Status**: ${body.object_attributes.status}`,
            })
        },
        build({ body }, output) {
            const project = body.project || body.repository
            output.addEmbed({
                title: `Build #${body.build_id} on ${project.name}`,
                url: `${project.homepage}/builds/${body.build_id}`,
                author: authorFromBody(body),
                description: `**Status**: ${body.build_status}`,
            })
        },
    },
})

const ISSUE_ACTIONS: Record<string, string> = {
    open: 'Opened',
    close: 'Closed',
    reopen: 'Reopened',
    update: 'Updated',
}

const MERGE_REQUEST_ACTIONS: Record<string, string> = {
    open: 'Opened',
    close: 'Closed',
    reopen: 'Reopened',
    update: 'Updated',
    merge: 'Merged',
    approved: 'Approved',
    unapproved: 'Unapproved',
}

function pushEvent(body: Record<string, any>): Embed {
    const project = projectFromBody(body)
    const embed: Embed = { author: authorFromPush(body) }

    if (project.totalCommitsCount > 0) {
        const fields: EmbedField[] = project.commits.map((commit) => {
            const message = commit.message.length > 256 ? commit.message.substring(0, 255) + '\u2026' : commit.message
            return {
                name: `Commit from ${commit.author.name}`,
                value: `([\`${commit.id.substring(0, 7)}\`](${commit.url})) ${message == null ? '' : message.replace(/\n/g, ' ').replace(/\r/g, ' ')}`,
                inline: false,
            }
        })
        embed.title = `[${project.name}:${project.branch}] ${project.totalCommitsCount} commit${project.totalCommitsCount > 1 ? 's' : ''}`
        embed.url = `${project.url}/tree/${project.branch}`
        embed.fields = fields
    } else if (body.after !== '0000000000000000000000000000000000000000') {
        embed.title = `[${project.name}:${project.branch}] New branch created: ${project.branch}`
        embed.url = `${project.url}/tree/${project.branch}`
    } else {
        embed.title = `[${project.name}:${project.branch}] Branch deleted: ${project.branch}`
        embed.url = project.url
    }
    return embed
}

function tagPushEvent(body: Record<string, any>): Embed {
    const tag = body.ref.split('/').slice(2).join('/')
    const project = projectFromBody(body)
    return {
        title:
            body.after !== '0000000000000000000000000000000000000000'
                ? `Pushed tag "${tag}" to ${project.name}`
                : `Deleted tag "${tag}" to ${project.name}`,
        url: `${project.url}/tags/${tag}`,
        author: authorFromPush(body),
        description:
            body.message == null
                ? ''
                : body.message.length > 1024
                  ? body.message.substring(0, 1023) + '\u2026'
                  : body.message,
    }
}

function changeEvent(body: Record<string, any>, resource: string, actions: Record<string, string>): Embed {
    const attributes = body.object_attributes
    const embed: Embed = {
        title: `${actions[attributes.action]} ${resource} #${attributes.iid} on ${body.project.name}`,
        url: attributes.url,
        author: authorFromBody(body),
    }
    if (attributes.description !== '') {
        embed.fields = [
            {
                name: attributes.title,
                value:
                    attributes.description.length > 1024
                        ? attributes.description.substring(0, 1023) + '\u2026'
                        : attributes.description,
            },
        ]
    } else {
        embed.description = `**${attributes.title}**`
    }
    return embed
}

function noteEvent(body: Record<string, any>): Embed {
    let type: string
    switch (body.object_attributes.noteable_type) {
        case 'Commit':
            type = `commit (${body.commit.id.substring(0, 7)})`
            break
        case 'MergeRequest':
            type = `merge request #${body.merge_request.iid}`
            break
        case 'Issue':
            type = `issue #${body.issue.iid}`
            break
        case 'Snippet':
            type = `snippet #${body.snippet.id}`
            break
        default:
            type = 'unknown'
    }
    const note = body.object_attributes.note
    return {
        title: `Wrote a comment on ${type} on ${body.project.name}`,
        url: body.object_attributes.url,
        author: authorFromBody(body),
        description: note.length > 2048 ? note.substring(0, 2047) + '\u2026' : note,
    }
}

function wikiPageEvent(body: Record<string, any>): Embed {
    const actions: Record<string, string> = { create: 'Created', delete: 'Deleted', update: 'Updated' }
    const attributes = body.object_attributes
    return {
        title: `${actions[attributes.action]} wiki page ${attributes.title} on ${body.project.name}`,
        url: attributes.url,
        author: authorFromBody(body),
        description:
            attributes.message == null
                ? ''
                : attributes.message.length > 2048
                  ? attributes.message.substring(0, 2047) + '\u2026'
                  : attributes.message,
    }
}

function formatAvatarUrl(url: string): string {
    return /^https?:\/\/|^\/\//i.test(url) ? url : `https://gitlab.com${url}`
}

function authorFromBody(body: Record<string, any>): EmbedAuthor {
    return { name: body.user.name, icon_url: formatAvatarUrl(body.user.avatar_url) }
}

function authorFromPush(body: Record<string, any>): EmbedAuthor {
    return { name: body.user_name, icon_url: formatAvatarUrl(body.user_avatar) }
}

function projectFromBody(body: Record<string, any>): Project {
    const branch = body.ref.split('/').slice(2).join('/')
    if (body.project != null) {
        return {
            name: body.project.name,
            url: body.project.web_url,
            branch,
            commits: body.commits || [],
            totalCommitsCount: body.total_commits_count || 0,
        }
    }
    if (body.repository != null) {
        return {
            name: body.repository.name,
            url: body.repository.homepage,
            branch,
            commits: body.commits || [],
            totalCommitsCount: body.total_commits_count || 0,
        }
    }
    throw new Error("Failed to resolve project from body! Did GitLab's webhook format change?")
}
