import type { Embed, EmbedField } from '../model/DiscordApi.ts'
import { DirectParseProvider } from './BaseProvider.ts'

const DISCORD_EMBED_CHARACTER_LIMIT = 6000
const SKYHOOK_FOOTER_TEXT = 'Powered by skyhookapi.com'
const CONTENT_SUMMARY_RESERVE = 64

interface HuggingFaceUrl {
    web: string
    api?: string
}

interface HuggingFaceRepo {
    type: 'dataset' | 'model' | 'space'
    name: string
    id: string
    private: boolean
    url: HuggingFaceUrl
    owner: { id: string }
    headSha?: string
}

interface HuggingFaceDiscussion {
    id: string
    num: number
    title: string
    status: string
    isPullRequest: boolean
    url: HuggingFaceUrl
    changes?: {
        base?: string
        mergeCommitId?: string
    }
}

interface HuggingFaceComment {
    id: string
    hidden: boolean
    content?: string
    url: HuggingFaceUrl
}

interface HuggingFaceUpdatedRef {
    ref: string
    oldSha?: string | null
    newSha?: string | null
}

interface HuggingFacePayload {
    event: {
        action: string
        scope: string
    }
    repo: HuggingFaceRepo
    discussion?: HuggingFaceDiscussion
    comment?: HuggingFaceComment
    movedTo?: {
        name: string
    }
    updatedRefs?: HuggingFaceUpdatedRef[]
    updatedConfig?: {
        private?: boolean
    }
}

/**
 * https://huggingface.co/docs/hub/main/webhooks
 */
export class HuggingFace extends DirectParseProvider {
    constructor() {
        super()
        this.setEmbedColor(0xffd21e)
        this.payload.username = 'Hugging Face'
        this.payload.allowed_mentions = { parse: [] }
    }

    public getName(): string {
        return 'Hugging Face'
    }

    public getPath(): string {
        return 'huggingface'
    }

    public async parseData(): Promise<void> {
        const body = this.body as HuggingFacePayload
        const scope = body.event.scope

        if (scope === 'discussion.comment' || scope.startsWith('discussion.comment.')) {
            this.addEmbed(this.formatComment(body))
        } else if (scope === 'discussion' || scope.startsWith('discussion.')) {
            this.addEmbed(this.formatDiscussion(body))
        } else if (scope === 'repo.config' || scope.startsWith('repo.config.')) {
            this.addEmbed(this.formatRepoConfig(body))
        } else if (scope === 'repo.content' || scope.startsWith('repo.content.')) {
            this.addEmbed(this.formatRepoContent(body))
        } else if (scope === 'repo' || scope.startsWith('repo.')) {
            this.addEmbed(this.formatRepo(body))
        } else {
            this.addEmbed(this.formatUnknownScope(body))
        }
    }

    private formatRepo(body: HuggingFacePayload): Embed {
        const action = HuggingFace.actionLabel(body.event.action)
        const embed: Embed = { url: body.repo.url.web }

        if (body.event.action === 'move' && body.movedTo != null) {
            embed.title = HuggingFace.truncate(`Moved ${body.repo.type} ${body.repo.name} to ${body.movedTo.name}`, 256)
            embed.description = `**New name:** \`${HuggingFace.escapeInlineCode(body.movedTo.name)}\``
            return embed
        }

        embed.title = HuggingFace.truncate(`${action} ${body.repo.type} ${body.repo.name}`, 256)
        embed.description = `**Visibility:** ${body.repo.private ? 'Private' : 'Public'}`
        return embed
    }

    private formatRepoContent(body: HuggingFacePayload): Embed {
        const embed: Embed = {
            title: HuggingFace.truncate(`Updated content in ${body.repo.type} ${body.repo.name}`, 256),
            url: body.repo.url.web,
        }
        const updatedRefs = body.updatedRefs ?? []
        const fields: EmbedField[] = []
        let remainingCharacters =
            DISCORD_EMBED_CHARACTER_LIMIT -
            (embed.title?.length ?? 0) -
            SKYHOOK_FOOTER_TEXT.length -
            CONTENT_SUMMARY_RESERVE

        for (const updatedRef of updatedRefs.slice(0, 25)) {
            const field = this.formatUpdatedRef(body.repo, updatedRef)
            const fieldCharacters = field.name.length + field.value.length
            if (fieldCharacters > remainingCharacters) {
                break
            }
            fields.push(field)
            remainingCharacters -= fieldCharacters
        }

        if (fields.length > 0) {
            embed.fields = fields
        }
        if (fields.length < updatedRefs.length) {
            embed.description = `Showing ${fields.length} of ${updatedRefs.length} updated references.`
        } else if (body.repo.headSha != null && fields.length === 0) {
            embed.description = `Latest commit: ${this.commitLink(body.repo, body.repo.headSha)}`
        } else if (fields.length === 0) {
            embed.description = 'Repository content changed.'
        }
        return embed
    }

    private formatUpdatedRef(repo: HuggingFaceRepo, updatedRef: HuggingFaceUpdatedRef): EmbedField {
        const { kind, name } = HuggingFace.describeRef(updatedRef.ref)
        const change = updatedRef.oldSha == null ? 'Created' : updatedRef.newSha == null ? 'Deleted' : 'Updated'
        const shas = [
            updatedRef.oldSha == null ? null : this.commitLink(repo, updatedRef.oldSha),
            updatedRef.newSha == null ? null : this.commitLink(repo, updatedRef.newSha),
        ].filter((sha): sha is string => sha != null)

        return {
            name: HuggingFace.truncate(`${change} ${kind} ${name}`, 256),
            value: HuggingFace.truncate(shas.join(' → '), 1024),
        }
    }

    private formatRepoConfig(body: HuggingFacePayload): Embed {
        return {
            title: HuggingFace.truncate(`Updated settings for ${body.repo.type} ${body.repo.name}`, 256),
            url: body.repo.url.web,
            description:
                body.updatedConfig?.private == null
                    ? 'Repository settings changed.'
                    : `**Visibility:** ${body.updatedConfig.private ? 'Private' : 'Public'}`,
        }
    }

    private formatDiscussion(body: HuggingFacePayload): Embed {
        const discussion = HuggingFace.requireDiscussion(body)
        const kind = discussion.isPullRequest ? 'pull request' : 'discussion'
        const embed: Embed = {
            title: HuggingFace.truncate(
                `${HuggingFace.actionLabel(body.event.action)} ${kind} #${discussion.num} on ${body.repo.name}: ${discussion.title}`,
                256,
            ),
            url: discussion.url.web,
            fields: [
                {
                    name: 'Status',
                    value: HuggingFace.titleCase(discussion.status),
                    inline: true,
                },
            ],
        }

        if (discussion.changes?.base != null) {
            embed.fields!.push({
                name: 'Base',
                value: HuggingFace.truncate(HuggingFace.stripRefPrefix(discussion.changes.base), 1024),
                inline: true,
            })
        }
        if (body.comment?.hidden === true) {
            embed.description = 'This comment was hidden.'
        } else if (body.comment?.content != null) {
            embed.description = HuggingFace.truncate(body.comment.content, 4096)
        }
        return embed
    }

    private formatComment(body: HuggingFacePayload): Embed {
        const discussion = HuggingFace.requireDiscussion(body)
        const comment = HuggingFace.requireComment(body)
        const kind = discussion.isPullRequest ? 'pull request' : 'discussion'
        const action = body.event.action === 'create' ? 'New' : HuggingFace.actionLabel(body.event.action)

        return {
            title: HuggingFace.truncate(
                `${action} comment on ${kind} #${discussion.num} in ${body.repo.name}: ${discussion.title}`,
                256,
            ),
            url: comment.url.web,
            description:
                comment.hidden || comment.content == null
                    ? 'This comment was hidden.'
                    : HuggingFace.truncate(comment.content, 4096),
        }
    }

    private formatUnknownScope(body: HuggingFacePayload): Embed {
        return {
            title: HuggingFace.truncate(
                `${HuggingFace.actionLabel(body.event.action)} ${body.event.scope} for ${body.repo.type} ${body.repo.name}`,
                256,
            ),
            url: body.repo.url.web,
            description: 'A Hugging Face Hub event was received.',
        }
    }

    private commitLink(repo: HuggingFaceRepo, sha: string): string {
        const shortSha = sha.slice(0, 7)
        return `[\`${shortSha}\`](${repo.url.web}/commit/${encodeURIComponent(sha)})`
    }

    private static requireDiscussion(body: HuggingFacePayload): HuggingFaceDiscussion {
        if (body.discussion == null) {
            throw new Error(`Hugging Face ${body.event.scope} payload is missing discussion data.`)
        }
        return body.discussion
    }

    private static requireComment(body: HuggingFacePayload): HuggingFaceComment {
        if (body.comment == null) {
            throw new Error(`Hugging Face ${body.event.scope} payload is missing comment data.`)
        }
        return body.comment
    }

    private static actionLabel(action: string): string {
        const labels: Record<string, string> = {
            create: 'Created',
            delete: 'Deleted',
            move: 'Moved',
            update: 'Updated',
        }
        return labels[action] ?? HuggingFace.titleCase(action)
    }

    private static describeRef(ref: string): { kind: string; name: string } {
        if (ref.startsWith('refs/heads/')) {
            return { kind: 'branch', name: ref.slice('refs/heads/'.length) }
        }
        if (ref.startsWith('refs/tags/')) {
            return { kind: 'tag', name: ref.slice('refs/tags/'.length) }
        }
        return { kind: 'reference', name: HuggingFace.stripRefPrefix(ref) }
    }

    private static stripRefPrefix(ref: string): string {
        return ref.replace(/^refs\/(heads|tags)\//, '')
    }

    private static titleCase(value: string): string {
        return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1)
    }

    private static escapeInlineCode(value: string): string {
        return value.replace(/`/g, '\u02cb')
    }

    private static truncate(value: string, limit: number): string {
        return value.length > limit ? value.slice(0, limit - 1) + '…' : value
    }
}
