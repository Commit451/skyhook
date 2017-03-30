// server.js

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const gitlab = require('./providers/gitlab')
const travis = require('./providers/travis')
const circleci = require('./providers/circleci')
const appveyor = require('./providers/appveyor')

const providers = {
  'gitlab': gitlab,
  'travis': travis,
  'circleci': circleci,
  'appveyor': appveyor
}

const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))

// Serve the URL generator
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html')
})

app.post("/api/webhooks/:hookPart1/:hookPart2/:from", function (req, res) {

  if(req.params.hookPart1 === 'undefined' || req.params.hookPart2 === 'undefined') {
    res.sendStatus(500)
  }

  const hookPart1 = req.params.hookPart1
  const hookPart2 = req.params.hookPart2

  const provider = req.params.from
  const discordHookUrl = "https://discordapp.com/api/webhooks/" + hookPart1 + "/" + hookPart2

  // https://discordapp.com/developers/docs/resources/webhook#execute-webhook
  let payload = {}

  if(typeof providers[provider] !== 'undefined') {

    // For old-style provider/from implementation.
    // TODO: convert non-class providers to class implementation
    if(typeof providers[provider] === 'function') {
      const instance = new providers[provider](req)
      payload = instance.execute()
    } else {
      providers[provider].parse(req, payload)
    }

  } else {
    // TODO: Return some error.
    console.log("Unknown provider ", from)
  }

  // switch(from) {
  //   case "gitlab":
  //     gitlab.parse(req, payload)
  //     break;
  //   case "travis":
  //     travis.parse(req, payload)
  //     break;
  //   case "circleci":
  //     circleci.parse(req, payload)
  //     break;
  //   case "appveyor":
  //     appveyor.parse(req, payload)
  //     break;
  //   default:
  //     console.log("Unknown from: " + from)
  // }

  console.log(payload)

  const hookData = JSON.stringify(payload)
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     discordHookUrl,
    body:    hookData
  }, function(err, response, body) {
    if(err) {
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })

})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ', listener.address().port)
})
