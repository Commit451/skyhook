// jenkins.js
// https://plugins.jenkins.io/notification
// ========
const BaseProvider = require('../util/BaseProvider');

class Jenkins extends BaseProvider {
    static getName() {
        return 'Jenkins-Ci';
    }

    async parseData(){
        this.payload.setEmbedColor(0xF0D6B7);
        const phase = this.body.build.phase;

        switch(phase){
            case "STARTED":
                this.payload.addEmbed({
                    title: "Project " + this.body.name,
                    url: this.body.build.full_url,
                    description: "Started build #" + this.body.build.number
                });
                break;
            case "COMPLETED":
            case "FINALIZED":
                this.payload.addEmbed({
                    title: "Project " + this.body.name,
                    url: this.body.build.full_url,
                    description: Jenkins.capitalize(phase) + " build #" + this.body.build.number + " with status: " + this.body.build.status
                });
                break;
        }
    }

    static capitalize(str){
        const tmp = str.toLowerCase();
        return tmp.charAt(0).toUpperCase() + tmp.slice(1);
    }
}

module.exports = Jenkins;