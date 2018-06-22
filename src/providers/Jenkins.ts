import { BaseProvider } from "../util/BaseProvider"

/**
 * https://plugins.jenkins.io/notification
 */
class Jenkins extends BaseProvider {

    public static getName() {
        return 'Jenkins-CI'
    }

    private static capitalize(str: string) {
        const tmp = str.toLowerCase()
        return tmp.charAt(0).toUpperCase() + tmp.slice(1)
    }

    public async parseData() {
        this.payload.setEmbedColor(0xF0D6B7)
        const phase = this.body.build.phase

        switch (phase) {
            case "STARTED":
                this.payload.addEmbed({
                    title: "Project " + this.body.name,
                    url: this.body.build.full_url,
                    description: "Started build #" + this.body.build.number,
                })
                break
            case "COMPLETED":
            case "FINALIZED":
                this.payload.addEmbed({
                    title: "Project " + this.body.name,
                    url: this.body.build.full_url,
                    description: Jenkins.capitalize(phase) + " build #" + this.body.build.number + " with status: " + this.body.build.status,
                })
                break
        }
    }
}

export { Jenkins }
