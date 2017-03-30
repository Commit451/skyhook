const camel = require('camelcase')
const BaseProvider = require('./base')

class Gitlab extends BaseProvider {

  constructor(req) {
    super(req)

    this.colors = {
      'push': 3355443,
      'pending': 9459106,
      'success': 6073213,
      'running': 9459106,
      'failed': 15146294,
      'canceled': 15146294,
      'created': 3447003,
    }
  }

  execute() {
    const type = camel(this.hook.object_kind)

    // run the method dynamically based on the type of "action"
    if(typeof this[type] !== 'undefined') {
      this[type]()
    }

    return this.payload
  }

  push() {
    const commits = this.hook.total_commits_count
    const commitString = (commits > 1) ? 'commits' : 'commit'
    const verb = (commits > 1) ? 'were' : 'was';

    // NOTE: Another option for showing commits.
    // let commitStr = '';
    // for(let commit of this.hook.commits) {
    //   commitStr += `${commit.message}\n`
    // }

    this.pushEmbed({
      title: `${commits} ${commitString} ${verb} pushed to ${this.hook.project.namespace}/${this.hook.project.name}`,
      url: this.hook.project.web_url,
      color: this.colors['push'],
      description: commitStr,
      author: {
        name: this.hook.user_name,
        icon_url: this.hook.user_avatar
      },
    })

    // NOTE: Uncomment if you want to show commit messages.
    // for(let commit of this.hook.commits) {
    //   this.pushEmbed({
    //     title: commit.id.substring(0, 8),
    //     description: commit.message,
    //     url: commit.url
    //   })
    // }
  }

  tagPush() {
    var url = this.hook.project.web_url
    var projectName = this.hook.project.name
    //get the name of the tag
    var split = this.hook.ref.split("/");
    var tag = split[2]
    this.payload.content = username + " pushed tag " + ref + " to " + projectName + "\n" + url + "/tags/" + tag;
  }

  pipeline() {
    this.pushEmbed({
      color: this.colors[this.hook.object_attributes.status],
      title: 'Pipeline Status Changed',
      fields: [
        { name: "Pipeline", value: this.hook.object_attributes.id, inline: true },
        { name: "Status", value: this.hook.object_attributes.status, inline: true }
      ]
    })
  }

  build() {
    let color = this.colors[this.hook.build_status]
    let fields = [
      { name: "Build ID", value: this.hook.build_id, inline: true },
      { name: "Build Stage", value: this.hook.build_stage, inline: true },
      { name: "Build Status", value: this.hook.build_status, inline: true }
    ]

    console.log(this.hook.build_duration)
    if(this.hook.build_duration !== null) {
      fields.push({ name: "Build Duration", value: `${Math.round(this.hook.build_duration)} seconds` })
    }

    this.pushEmbed({
      color,
      title: `Build ${this.hook.build_name} ${this.hook.build_status}`,
      description: `building ${this.hook.project_name}`,
      fields
    })
  }

  wikiPage() {
    var action = this.hook.object_attributes.state
    var user = this.hook.user.username
    var issueUrl = this.hook.object_attributes.url
    this.payload.content = user + " " + action + " wiki page\n" + issueUrl;
  }

  mergeRequest() {
    var action = this.hook.object_attributes.state
    var user = this.hook.user.username
    var issueUrl = this.hook.object_attributes.url
    this.payload.content = user + " " + action + " merge request\n" + issueUrl;
  }

  note() {
    var projectName = this.hook.project.name
    var action = this.hook.object_attributes.state
    var user = this.hook.user.username
    var noteUrl = this.hook.object_attributes.url
    var noteType = this.hook.object_attributes.noteable_type
    var note = this.hook.object_attributes.note
    this.payload.content = user + " commented on " + noteType + " on " + projectName + "\n" + "\"" + note+ "\"" + "\n" + noteUrl;
  }

  issue() {
    var projectName = this.hook.project.name
    var action = this.hook.object_attributes.state
    var user = this.hook.user.username
    var issueUrl = this.hook.object_attributes.url
    this.payload.content = user + " " + action + " issue on " + projectName + "\n" + issueUrl;
  }


}

module.exports = Gitlab
