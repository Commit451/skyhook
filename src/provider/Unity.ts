import { Embed } from '../model/Embed'
import { BaseProvider } from '../provider/BaseProvider'

/**
 * https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro
 */
class Unity extends BaseProvider {

    public getName() {
        return 'Unity Cloud'
    }

    public getPath() {
        return 'unity'
    }

    public async parseData() {
        this.setEmbedColor(0x222C37)
        const projectName = this.body.projectName
        const projectVersion = this.body.buildNumber
        let share = null
        try {
            share = this.body.links.artifacts[0].files.href
        } catch (err) {
            // Artifact not present
        }
        const type = this.body.buildStatus
        let content = 'No download available.'
        let download = ''
        this.payload.username = projectName + ' Buildserver'
        switch (type) {
            case 'success':
                if (share) {
                    download = share.href
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
        const embed = new Embed()
        embed.title = '[' + projectName + '] ' + ' version #' + projectVersion
        embed.url = download
        embed.description = content
        this.addEmbed(embed)
    }
}

export { Unity }
