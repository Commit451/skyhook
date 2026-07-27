import type { Embed, EmbedAuthor, EmbedField } from '../model/DiscordApi.ts'
import {
    DISCORD_EMBED_LIMITS,
    DISCORD_MESSAGE_LIMITS,
    fitLiteralEmbedFields,
    SKYHOOK_FOOTER_TEXT,
} from '../util/DiscordEmbed.ts'
import { cleanText, escapeDiscordMarkdownLiteral, humanizeWords, truncateText } from '../util/DiscordText.ts'
import { canonicalizeIso8601Timestamp, isRecord } from '../util/WebhookValue.ts'
import { DirectParseProvider } from './BaseProvider.ts'

const BUILDKITE_GREEN = 0x14cc80
const BUILDKITE_BLUE = 0x2196f3
const BUILDKITE_RED = 0xe53935
const BUILDKITE_YELLOW = 0xf0b429
const BUILDKITE_GRAY = 0x757575
const MAX_URL_CHARACTERS = 2048
const EVENT_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*$/

interface ParsedEvent {
    embed: Embed
    status: string
}

/**
 * Converts Buildkite Pipelines and Package Registries webhooks, plus documented Test Engine workflow envelopes,
 * into bounded Discord embeds.
 *
 * Buildkite can authenticate deliveries with a configured token or an HMAC over the raw request body. Skyhook's
 * generated URL does not carry or store that token, so this provider cannot authenticate the delivery and treats
 * all webhook content as untrusted display data.
 *
 * @see https://buildkite.com/docs/apis/webhooks
 */
export class Buildkite extends DirectParseProvider {
    public constructor() {
        super()
        this.setEmbedColor(BUILDKITE_GREEN)
        this.payload.username = 'Buildkite'
        this.payload.allowed_mentions = { parse: [] }
    }

    public getName(): string {
        return 'Buildkite'
    }

    public getPath(): string {
        return 'buildkite'
    }

    public async parseData(): Promise<void> {
        if (!isRecord(this.body)) {
            this.nullifyPayload()
            return
        }

        const event = boundedEvent(this.body.event)
        const headerValue = getHeaderValue(this.headers, 'x-buildkite-event')
        const headerEvent = headerValue === undefined ? undefined : boundedEvent(headerValue)
        if (event == null || (headerValue !== undefined && headerEvent !== event)) {
            this.nullifyPayload()
            return
        }

        const parsed = this.parseEvent(event)
        if (parsed == null) {
            this.nullifyPayload()
            return
        }

        const author = senderAuthor(this.body.sender)
        if (author != null) {
            parsed.embed.author = author
        }
        parsed.embed.fields = fitEscapedFieldsWithinAggregateLimit(parsed.embed)
        this.setEmbedColor(statusColor(parsed.status))
        this.addEmbed(parsed.embed)
    }

    private parseEvent(event: string): ParsedEvent | null {
        if (event.startsWith('build.')) {
            return parseBuildEvent(event, this.body)
        }
        if (event.startsWith('job.')) {
            return parseJobEvent(event, this.body)
        }
        if (event.startsWith('agent.')) {
            return parseAgentEvent(event, this.body)
        }
        if (event === 'cluster_token.registration_blocked') {
            return parseBlockedRegistrationEvent(this.body)
        }
        if (event === 'ping') {
            return parsePingEvent(this.body)
        }
        if (event.startsWith('package.')) {
            return parsePackageEvent(event, this.body)
        }
        if (event.startsWith('workflow.')) {
            return parseWorkflowEvent(event, this.body)
        }
        return parseGenericEvent(event, this.body)
    }
}

function parseBuildEvent(event: string, body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.build) || !isRecord(body.pipeline)) {
        return null
    }

    const pipelineName = scalarText(body.pipeline.name)
    const buildNumber = positiveIntegerText(body.build.number)
    const state = buildEventStatus(event, body.build)
    if (pipelineName == null || buildNumber == null || state == null) {
        return null
    }

    const embed: Embed = {
        title: literal(`${pipelineName} build #${buildNumber} ${statusLabel(state)}`, DISCORD_EMBED_LIMITS.title, true),
    }
    const description = scalarText(body.build.message)
    if (description != null) {
        embed.description = literal(description, DISCORD_EMBED_LIMITS.description, false)
    }
    setTrustedUrl(embed, body.build.web_url, body.pipeline.web_url)
    embed.timestamp = buildTimestamp(event, body.build) ?? undefined
    embed.fields = fitLiteralEmbedFields(embed, buildFields(body.build))

    return { embed, status: state }
}

function parseJobEvent(event: string, body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.job) || !isRecord(body.build) || !isRecord(body.pipeline)) {
        return null
    }

    const pipelineName = scalarText(body.pipeline.name)
    const buildNumber = positiveIntegerText(body.build.number)
    const jobName = firstScalar(body.job.name, body.job.step_key, body.job.type)
    const state = boundedToken(body.job.state) ?? eventAction(event)
    if (pipelineName == null || buildNumber == null || jobName == null || state == null) {
        return null
    }

    const embed: Embed = {
        title: literal(
            `${pipelineName} build #${buildNumber}: ${jobName} ${jobStatusLabel(event, state)}`,
            DISCORD_EMBED_LIMITS.title,
            true,
        ),
    }
    const promisedReason = scalarText(body.promised_exit_status_reason)
    if (promisedReason != null) {
        embed.description = literal(promisedReason, DISCORD_EMBED_LIMITS.description, false)
    }
    setTrustedUrl(embed, body.job.web_url, body.build.web_url, body.pipeline.web_url)
    embed.timestamp = jobTimestamp(event, body.job) ?? undefined
    embed.fields = fitLiteralEmbedFields(embed, jobFields(body.job, body.build))

    return { embed, status: jobColorStatus(event, state) }
}

function parseAgentEvent(event: string, body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.agent)) {
        return null
    }

    const action = eventAction(event)
    const agentName = scalarText(body.agent.name)
    if (action == null || agentName == null) {
        return null
    }

    const embed: Embed = {
        title: literal(`Agent ${statusLabel(action)}: ${agentName}`, DISCORD_EMBED_LIMITS.title, true),
    }
    setTrustedUrl(embed, body.agent.web_url)
    embed.timestamp = agentTimestamp(action, body.agent) ?? undefined
    embed.fields = fitLiteralEmbedFields(embed, agentFields(body.agent, body.blocked_ip))

    return { embed, status: action }
}

function parseBlockedRegistrationEvent(body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.cluster_token)) {
        return null
    }

    const fields: EmbedField[] = []
    addField(fields, 'Agent token', firstScalar(body.cluster_token.description, body.cluster_token.name))
    addField(fields, 'Blocked IP', scalarText(body.blocked_ip))
    const embed: Embed = { title: 'Agent registration blocked' }
    embed.fields = fitLiteralEmbedFields(embed, fields)
    return { embed, status: 'blocked' }
}

function parsePingEvent(body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.service) || !isRecord(body.organization)) {
        return null
    }

    const fields: EmbedField[] = []
    addField(fields, 'Organization', firstScalar(body.organization.name, body.organization.slug))
    const embed: Embed = { title: 'Buildkite webhook settings updated' }
    embed.fields = fitLiteralEmbedFields(embed, fields)
    return { embed, status: 'connected' }
}

function parsePackageEvent(event: string, body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.package)) {
        return null
    }

    const action = eventAction(event)
    const packageName = scalarText(body.package.name)
    if (action == null || packageName == null) {
        return null
    }

    const embed: Embed = {
        title: literal(`Package ${statusLabel(action)}: ${packageName}`, DISCORD_EMBED_LIMITS.title, true),
    }
    setTrustedUrl(embed, body.package.web_url)
    embed.timestamp = firstTimestamp(body.package.created_at, body.created_at) ?? undefined
    const fields: EmbedField[] = []
    addField(fields, 'Registry', nestedScalar(body.package.registry, 'name', 'slug'))
    addField(fields, 'Organization', nestedScalar(body.package.organization, 'name', 'slug'))
    embed.fields = fitLiteralEmbedFields(embed, fields)
    return { embed, status: action }
}

function parseWorkflowEvent(event: string, body: Record<string, any>): ParsedEvent | null {
    if (!isRecord(body.subject) || !isRecord(body.workflow_event)) {
        return null
    }

    const subjectName = firstScalar(body.subject.test_full_name, body.subject.name, body.subject.type)
    const monitor = firstScalar(body.workflow_event.type, body.type)
    if (subjectName == null || monitor == null) {
        return null
    }

    const embed: Embed = {
        title: literal(`${humanizeWords(event)}: ${subjectName}`, DISCORD_EMBED_LIMITS.title, true),
    }
    setTrustedUrl(embed, body.subject.test_url, body.workflow_url)
    embed.timestamp = firstTimestamp(body.timestamp, body.created_at) ?? undefined
    const fields: EmbedField[] = []
    addField(fields, 'Monitor', humanizeWords(monitor))
    addField(fields, 'Location', scalarText(body.subject.test_location), false)
    embed.fields = fitLiteralEmbedFields(embed, fields)
    return { embed, status: eventAction(event) ?? 'workflow' }
}

function parseGenericEvent(event: string, body: Record<string, any>): ParsedEvent {
    const embed: Embed = {
        title: literal(humanizeWords(event), DISCORD_EMBED_LIMITS.title, true),
    }
    setTrustedUrl(embed, body.web_url, body.url)
    embed.timestamp = firstTimestamp(body.timestamp, body.created_at) ?? undefined
    return { embed, status: eventAction(event) ?? event }
}

function buildFields(build: Record<string, any>): EmbedField[] {
    const fields: EmbedField[] = []
    addField(fields, 'Branch', scalarText(build.branch))
    const commit = boundedText(build.commit, 128, true)
    addField(fields, 'Commit', commit == null ? null : commit.slice(0, 7))
    const source = boundedToken(build.source)
    addField(fields, 'Source', source == null ? null : humanizeWords(source))
    return fields
}

function jobFields(job: Record<string, any>, build: Record<string, any>): EmbedField[] {
    const fields: EmbedField[] = []
    addField(fields, 'Branch', scalarText(build.branch))
    addField(fields, 'Exit status', safeIntegerText(job.exit_status))
    addField(fields, 'Promised exit status', safeIntegerText(job.promised_exit_status))
    addField(fields, 'Agent', nestedScalar(job.agent, 'name'))
    return fields
}

function agentFields(agent: Record<string, any>, blockedIp: unknown): EmbedField[] {
    const fields: EmbedField[] = []
    const connectionState = boundedToken(agent.connection_state)
    addField(fields, 'State', connectionState == null ? null : humanizeWords(connectionState))
    addField(fields, 'Hostname', scalarText(agent.hostname))
    addField(fields, 'Queue', scalarText(agent.queue))
    addField(fields, 'Version', scalarText(agent.version))
    addField(fields, 'Blocked IP', scalarText(blockedIp))
    return fields
}

function addField(fields: EmbedField[], name: string, value: string | null, inline = true): void {
    if (value != null) {
        fields.push({ name, value, inline })
    }
}

function fitEscapedFieldsWithinAggregateLimit(embed: Embed): EmbedField[] {
    let usedCharacters =
        (embed.title?.length ?? 0) +
        (embed.description?.length ?? 0) +
        (embed.author?.name.length ?? 0) +
        SKYHOOK_FOOTER_TEXT.length
    const fields: EmbedField[] = []
    for (const field of embed.fields ?? []) {
        const remainingValueCharacters = DISCORD_MESSAGE_LIMITS.embedCharacters - usedCharacters - field.name.length
        if (remainingValueCharacters <= 0) {
            break
        }
        const value = truncateText(
            field.value,
            Math.min(DISCORD_EMBED_LIMITS.fieldValue, remainingValueCharacters),
            false,
        )
        if (value.length === 0) {
            continue
        }
        fields.push({ ...field, value })
        usedCharacters += field.name.length + value.length
    }
    return fields
}

function senderAuthor(value: unknown): EmbedAuthor | null {
    const name = isRecord(value) ? scalarText(value.name) : typeof value === 'string' ? scalarText(value) : null
    return name == null ? null : { name: literal(name, DISCORD_EMBED_LIMITS.authorName, true) }
}

function nestedScalar(value: unknown, ...keys: string[]): string | null {
    if (!isRecord(value)) {
        return null
    }
    for (const key of keys) {
        const result = scalarText(value[key])
        if (result != null) {
            return result
        }
    }
    return null
}

function buildTimestamp(event: string, build: Record<string, any>): string | null {
    const action = eventAction(event)
    if (action === 'finished' || action === 'skipped') {
        return firstTimestamp(build.finished_at, build.scheduled_at, build.created_at)
    }
    if (action === 'running' || action === 'started') {
        return firstTimestamp(build.started_at, build.scheduled_at, build.created_at)
    }
    if (action === 'failing') {
        return firstTimestamp(build.failing_at, build.started_at, build.created_at)
    }
    return firstTimestamp(build.scheduled_at, build.created_at)
}

function jobTimestamp(event: string, job: Record<string, any>): string | null {
    const action = eventAction(event)
    if (action === 'finished') {
        return firstTimestamp(job.finished_at, job.started_at, job.created_at)
    }
    if (action === 'started') {
        return firstTimestamp(job.started_at, job.scheduled_at, job.created_at)
    }
    if (action === 'promised_exit_status') {
        return firstTimestamp(job.promised_exit_status_at, job.started_at, job.created_at)
    }
    return firstTimestamp(job.scheduled_at, job.created_at)
}

function agentTimestamp(action: string, agent: Record<string, any>): string | null {
    const timestampByAction: Record<string, unknown> = {
        connected: agent.connected_at,
        disconnected: agent.disconnected_at,
        lost: agent.lost_at,
        stopped: agent.stopped_at,
    }
    return firstTimestamp(timestampByAction[action], agent.created_at)
}

function firstTimestamp(...values: unknown[]): string | null {
    for (const value of values) {
        const timestamp = canonicalizeIso8601Timestamp(value)
        if (timestamp != null) {
            return timestamp
        }
    }
    return null
}

function setTrustedUrl(embed: Embed, ...values: unknown[]): void {
    for (const value of values) {
        const url = trustedBuildkiteUrl(value)
        if (url != null) {
            embed.url = url
            return
        }
    }
}

function trustedBuildkiteUrl(value: unknown): string | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_CHARACTERS) {
        return null
    }
    try {
        const url = new URL(value)
        if (
            url.protocol !== 'https:' ||
            (url.hostname !== 'buildkite.com' && !url.hostname.endsWith('.buildkite.com'))
        ) {
            return null
        }
        return url.href.length <= MAX_URL_CHARACTERS ? url.href : null
    } catch {
        return null
    }
}

function getHeaderValue(headers: unknown, name: string): unknown | undefined {
    if (headers instanceof Headers) {
        return headers.has(name) ? headers.get(name) : undefined
    }
    if (!isRecord(headers)) {
        return undefined
    }
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === name) {
            return value
        }
    }
    return undefined
}

function boundedEvent(value: unknown): string | null {
    const event = boundedText(value, 128, true)
    return event != null && EVENT_PATTERN.test(event) ? event : null
}

function boundedToken(value: unknown): string | null {
    const token = boundedText(value, 100, true)
    return token != null && /^[A-Za-z][A-Za-z0-9_-]*$/.test(token) ? token : null
}

function boundedText(value: unknown, maxLength: number, singleLine: boolean): string | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > maxLength * 2) {
        return null
    }
    const text = cleanText(value, singleLine)
    return text.length > 0 && text.length <= maxLength ? text : null
}

function scalarText(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return null
    }
    if (
        typeof value === 'number' &&
        (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))
    ) {
        return null
    }
    const text = cleanText(String(value), false)
    return text.length === 0 ? null : text
}

function firstScalar(...values: unknown[]): string | null {
    for (const value of values) {
        const result = scalarText(value)
        if (result != null) {
            return result
        }
    }
    return null
}

function safeIntegerText(value: unknown): string | null {
    return Number.isSafeInteger(value) ? String(value) : null
}

function positiveIntegerText(value: unknown): string | null {
    return Number.isSafeInteger(value) && Number(value) > 0 ? String(value) : null
}

function literal(value: string, maxLength: number, singleLine: boolean): string {
    return truncateText(escapeDiscordMarkdownLiteral(value), maxLength, singleLine)
}

function eventAction(event: string): string | null {
    const action = event.split('.').at(-1)
    return action == null ? null : boundedToken(action)
}

function statusLabel(status: string): string {
    return humanizeWords(status).toLowerCase()
}

function buildEventStatus(event: string, build: Record<string, any>): string | null {
    const action = eventAction(event)
    if (event === 'build.finished') {
        return build.blocked === true ? 'blocked' : (boundedToken(build.state) ?? action)
    }
    return action ?? boundedToken(build.state)
}

function jobStatusLabel(event: string, state: string): string {
    if (event === 'job.promised_exit_status') {
        return 'promised failure'
    }
    return statusLabel(event === 'job.finished' ? state : (eventAction(event) ?? state))
}

function jobColorStatus(event: string, state: string): string {
    if (event === 'job.promised_exit_status') {
        return 'failing'
    }
    return event === 'job.finished' ? state : (eventAction(event) ?? state)
}

function statusColor(status: string): number {
    const normalized = status.toLowerCase()
    if (
        [
            'failed',
            'failing',
            'broken',
            'timed_out',
            'timing_out',
            'waiting_failed',
            'unblocked_failed',
            'alarm',
            'lost',
        ].includes(normalized)
    ) {
        return BUILDKITE_RED
    }
    if (['scheduled', 'pending', 'waiting', 'blocked', 'blocked_failed', 'limited', 'stopping'].includes(normalized)) {
        return BUILDKITE_YELLOW
    }
    if (['running', 'started', 'assigned', 'accepted'].includes(normalized)) {
        return BUILDKITE_BLUE
    }
    if (['canceled', 'canceling', 'skipped', 'not_run', 'disconnected', 'stopped', 'archived'].includes(normalized)) {
        return BUILDKITE_GRAY
    }
    return BUILDKITE_GREEN
}
