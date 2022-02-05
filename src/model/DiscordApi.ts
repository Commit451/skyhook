/**
 * The data format needed for executing a webhook on Discord
 * 
 * @see https://discordapp.com/developers/docs/resources/webhook#execute-webhook
 */
export interface DiscordPayload {
    /**
     * The message contents (up to 2000 characters).
     * 
     * One of content, file, embeds are required.
     */
    content?: string
    /**
     * Override the default username of the webhook.
     */
    username?: string
    /**
     * Override the default avatar of the webhook.
     */
    avatar_url?: string
    /**
     * True if this is a TTS message.
     */
    tts?: boolean
    /**
     * Embedded rich content. Array can contain up to 10 embed objects.
     * 
     * One of content, file, embeds are required.
     */
    embeds?: Embed[]
    /**
     * Allowed mentions for the message.
     */
    allowed_mentions?: AllowedMentions
}
// Note: currently unsupported for DiscordPayload
// components, files[n], payload_json, attachments

/**
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
 */
export interface Embed {
    /**
     * Title of embed.
     */
    title?: string
    /**
     * Type of embed (always "rich" for webhook embeds).
     * @deprecated Embed types should be considered deprecated and might be removed in a future API version.
     */
    type?: EmbedType.RICH
    /**
     * Description of embed.
     */
    description?: string
    /**
     * Url of embed.
     */
    url?: string
    /**
     * Timestamp of embed content. ISO8601 format.
     */
    timestamp?: string
    /**
     * Color code of the embed.
     */
    color?: number
    /**
     * Footer information.
     */
    footer?: EmbedFooter
    /**
     * Image information.
     */
    image?: EmbedImage
    /**
     * Thumbnail information.
     */
    thumbnail?: EmbedThumbnail
    /**
     * Video information.
     */
    video?: EmbedVideo
    /**
     * Provider information.
     */
    provider?: EmbedProvider
    /**
     * Author information.
     */
    author?: EmbedAuthor
    /**
     * Fields information
     */
    fields?: EmbedField[]
}

/**
 * Embed types are "loosely defined" and, for the most part, are not used
 * by our clients for rendering. Embed attributes power what is rendered.
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-types
 * @deprecated Embed types should be considered deprecated and might be removed in a future API version.
 */
export enum EmbedType {
    /**
     * Generic embed rendered from embed attributes
     */
    RICH = 'rich',
    /**
     * Image embed
     */
    IMAGE = 'image',
    /**
     * Video embed.
     */
    VIDEO = 'video',
    /**
     * Animated gif image embed rendered as a video embed.
     */
    GIFV = 'gifv',
    /**
     * Article embed.
     */
    ARTICLE = 'article',
    /**
     * Link embed.
     */
    LINK = 'link'
}

/**
 * Embed Footer
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
export interface EmbedFooter {
    /**
     * Footer text.
     */
    text: string
    /**
     * Url of footer icon (only supports http(s) and attachments).
     */
    icon_url?: string
    /**
     * A proxied url of footer icon.
     */
    proxy_icon_url?: string
}

/**
 * Embed Image
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
export interface EmbedImage {
    /**
     * Source url of image (only supports http(s) and attachments).
     */
    url: string
    /**
     * A proxied url of the image.
     */
    proxy_url?: string
    /**
     * Height of image.
     */
    height?: number
    /**
     * Width of image.
     */
    width?: number
}

/**
 * Embed Thumbnail
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
 */
export interface EmbedThumbnail {
    /**
     * Source url of thumbnail (only supports http(s) and attachments).
     */
    url: string
    /**
     * A proxied url of the thumbnail.
     */
    proxy_url?: string
    /**
     * Height of thumbnail.
     */
    height?: number
    /**
     * Width of thumbnail.
     */
    width?: number
}

/**
 * Embed Video
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
 */
export interface EmbedVideo {
    /**
     * Source url of video.
     */
    url?: string
    /**
     * A proxied url of the video.
     */
    proxy_url?: string
    /**
     * Height of video.
     */
    height?: number
    /**
     * Width of video.
     */
    width?: number
}

/**
 * Embed Provider
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
 */
export interface EmbedProvider {
    /**
     * Name of provider.
     */
    name?: string
    /**
     * Url of provider.
     */
    url?: string
}

/**
 * Embed Author
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
export interface EmbedAuthor {
    /**
     * Name of author.
     */
    name: string
    /**
     * Url of author.
     */
    url?: string
    /**
     * Url of author icon (only supports http(s) and attachments).
     */
    icon_url?: string
    /**
     * A proxied url of author icon.
     */
    proxy_icon_url?: string
}

/**
 * Embed Field
 * 
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
 */
export interface EmbedField {
    /**
     * Name of the field.
     */
    name: string
    /**
     * Value of the field.
     */
    value: string
    /**
     * Whether or not this field should display inline.
     */
    inline?: boolean
}

/**
 * The allowed mention field allows for more granular control over mentions
 * without various hacks to the message content. This will always validate
 * against message content to avoid phantom pings (e.g. to ping everyone,
 * you must still have @everyone in the message content), and check against
 * user/bot permissions.
 * 
 * @see https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure
 */
export interface AllowedMentions {
    /**
     * An array of allowed mention types to parse from the content.
     * 
     * The parse field is mutually exclusive with the other fields. If parse is
     * defined, the other fields must be undefined or falsy (ie [], null), and
     * vice-versa.
     */
    parse?: AllowedMentionType[]
    /**
     * Array of role_ids to mention (Max size of 100).
     */
    roles?: string[]
    /**
     * Array of user_ids to mention (Max size of 100)
     */
    users?: string[]
    /**
     * For replies, whether to mention the author of the message being replied to (default false)
     */
    replied_user?: boolean
}

/**
 * Allowed Mention Types
 * 
 * @see https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
 */
export enum AllowedMentionType {
    /**
     * Controls role mentions.
     */
    ROLES = 'roles',
    /**
     * Controls user mentions.
     */
    USERS = 'users',
    /**
     * Controls @everyone and @here mentions.
     */
    EVERYONE = 'everyone'
}
