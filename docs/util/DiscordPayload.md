## Methods provided by `util\DiscordPayload`
Please have in mind that you can only use `util\DiscordPayload::setContent` **OR** `util\DiscordPayload::addEmbed`.  
You can't use both as it is not allowed by discord.

### `util\DiscordPayload::setEmbedColor(color)`
Sets the embed color for every embed that get added to this payload.  
`color` - integer - notation of a color (e.g. 0x306EFF or 3174143)

### `util\DiscordPayload::setContent(content)`
Sets the content message of the payload  
`content` - string - message

### `util\DiscordPayload::setUser(username, avatarUrl)`
Overrides the username and avatar of the bot user that posts to the specific channel  
`username` - string - username (e.g. TestBotUsername)  
`avatarUrl` - string - URL to a valid image

### `util\DiscordPayload::addEmbed(data)`
Adds the data as a embed to the payload  
`data` - object - embed structure as documented on [Discord Developer Documentation](https://discordapp.com/developers/docs/resources/channel#embed-object)

### `util\DiscordPayload::getData() : object`
Returns the whole payload data object