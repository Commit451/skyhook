# skyhook

Parses webhooks and forwards them in the proper format to Discord.

1. Create webhook on GitLab.com that points to our server
2. Parse the url, determine which user/server on discord to send the data to
3. Parse the payload from GitLab, format it in the way that Discord is expecting
4. Send the modified payload to Discord (some registered webhook there, or maybe the bot can post it)
https://support.discordapp.com/hc/en-us/articles/228383668

## Docs
https://gitlab.com/help/user/project/integrations/webhooks
https://discordapp.com/developers/docs/resources/webhook

\ ゜o゜)ノ
