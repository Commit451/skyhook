import { BaseProvider } from "../util/BaseProvider"

/**
 * https://build-api.cloud.unity3d.com/docs/1.0.0/index.html#operation-webhooks-intro
 */
class Unity extends BaseProvider {

    public static getName() {
        return 'Unity Cloud'
    }

    public async parseData() {
        this.payload.setEmbedColor(0x222C37)

        const projectName = this.body.projectName
        const projectTarget = this.body.buildTargetName
        const projectVersion = this.body.buildNumber
        let share = null
        if (this.body.links !== null) {
            share = this.body.links.share_url
        }
        const type = this.body.buildStatus
        let content = "No download available."
        const user = {
            name: projectTarget,
            icon_url: "https://developer.cloud.unity3d.com/images/icon-default.png",
        }
        let download = ""
        let link = ""
        this.payload.setUser(projectName + "Buildserver", "https://developer.cloud.unity3d.com/images/icon-default.png")
        switch (type) {
            case "success":
                if (share) {
                    download = share.href
                    content = "[`Download it here`](" + download + ")"
                }
                link = ""
                content = "**New build**\n" + content
                break
            case "queued":
                content = "**In build queue**\nIt will be update to version  #" + projectVersion + "\n"
                break
            case "started":
                content = "**Build is started**\nBuilding version  #" + projectVersion + "\n"
                break
            case "failed":
                content = "**Build failed**\n" + "Latest version is still  #" + (projectVersion - 1) + "\n"
                break

        }
        this.payload.addEmbed({
            title: "[" + projectName + "] " + " version #" + projectVersion,
            url: download,
            author: user,
            description: content,
        })
    }
}
export { Unity }
