// TODO: add some helper stuff or repeated things from providers in here.

class BaseProvider {
  constructor (req) {
    this.req = req
    this.hook = {}

    // Instead of typing this.body.whatever.something.
    // make it easier to find exactly what you're looking for from the webhook data.
    // looking back, probably not such a great idea.
    // for (let prop in req.body) {
    //   this.hook[prop] = req.body[prop]
    // }

    this.payload = {
      content: null,
      embeds: null,
      file: null
    }
  }

  pushEmbed(content) {
    if(this.payload.embeds === null) {
      this.payload.embeds = []
    }
    this.payload.embeds.push(content)
  }
}

module.exports = BaseProvider
