import { defineProvider } from './Provider.ts'

/**
 * https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro
 */
export const Unity = defineProvider({
    path: 'unity',
    name: 'Unity Cloud',
    example: { body: 'unity/unity.json' },
    defaults: { embedColor: 0x222c37 },
    map({ body }, output) {
        const projectName = body.projectName
        const projectVersion = body.buildNumber
        const download = body.links?.artifacts?.[0]?.files?.href ?? ''
        const type = body.buildStatus
        let content = 'No download available.'
        output.payload.username = projectName + ' Buildserver'

        switch (type) {
            case 'success':
                if (download.length > 0) {
                    content = '[`Download it here`](' + download + ')'
                }
                content = '**New build**\n' + content
                break
            case 'queued':
                content = '**In build queue**\nIt will be update to version  #' + projectVersion + '\n'
                break
            case 'started':
                content = '**Build is started**\nBuilding version  #' + projectVersion + '\n'
                break
            case 'failed':
                content = '**Build failed**\n' + 'Latest version is still  #' + (projectVersion - 1) + '\n'
                break
        }

        output.addEmbed({
            title: '[' + projectName + '] ' + ' version #' + projectVersion,
            url: download,
            description: content,
        })
    },
})
