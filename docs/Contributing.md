# Contributing

Skyhook happily accepts pull requests for new providers and features. To make the process quick and easy, follow this brief guide.

### Code Style

While writing your changes, please follow the code style maintained throughout the project. Skyhook does not follow a specific standard of javascript code, therefore you should browse some of the existing code to get a feel of the style. Here are some things to keep in mind.

* Always use `let` instead of `var`

* End statements with semicolons (`;`)

These are the two main style standards that the project maintains. Please put in an effort to keep the code style uniform throughout the entire project.

### Working on Changes

All of your changes should be made on a [fork](https://help.github.com/articles/fork-a-repo/) of the main project.

Once you are satisfied with your changes, you may submit a [pull request](https://help.github.com/articles/about-pull-requests/). This will give the project maintainers a chance to review the code you have submitted and, if necessary, request changes. Once the maintainers are happy with your changes, your pull request will be merged.

> Note that to add more commits to your pull request, you only need to push commits to the branch of your fork from which you based the pull request.

### Local Testing

In order to test the features you've implemented, it's a good idea to setup and run skyhook locally.

Ensure you have the latest version of Node.js installed and have cloned the repo. Open a command window in the root folder and run the command `npm install` to install the dependencies. From there you can start the server by simply running the command `npm start`.

In order to accept data from the webhook providers, you should forward the port which skyhook will bind to. By default, this is set to `8080`, however if another port is more convienient for you, you may change this in the code. **Be mindful not to submit this change in a pull request.**

> If you are unable to forward a port you may use [ngrok](https://ngrok.com/).

Once the port is forwarded, you should be able to start the server and have it open for requests. You can validate this by going to `{your-public-ip}:8080`. If the skyhook webpage loads, then the port is forwarded correctly.

From here you should be able to [setup](https://github.com/Commit451/skyhook#setup) webooks through your local copy of skyhook. **Note that when setting up your webhooks you MUST replace `skyhook.glitch.me` with `{your-public-ip}:8080`.**

If your changes work, the provider's webhooks should be parsed and forwarded to discord.

