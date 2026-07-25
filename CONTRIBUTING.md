# Contributing

Skyhook happily accepts pull requests for new providers and features. To make the process quick and easy, follow this brief guide.

### Code Style

Skyhook uses [Biome](https://biomejs.dev/) for formatting and linting. Run `npm run lint` before submitting a change and follow the style already used by nearby code.

### Working on Changes

All of your changes should be made on a [fork](https://help.github.com/articles/fork-a-repo/) of the main project.

Once you are satisfied with your changes, you may submit a [pull request](https://help.github.com/articles/about-pull-requests/). This will give the project maintainers a chance to review the code you have submitted and, if necessary, request changes. Once the maintainers are happy with your changes, your pull request will be merged.

> Note that to add more commits to your pull request, you only need to push commits to the branch of your fork from which you based the pull request.

### Local Testing

In order to test the features you've implemented, it's a good idea to setup and run skyhook locally.

Use Node 24, as specified by `.nvmrc`, and clone the repository. Run `npm install` in the root folder, then use `npm run dev` while developing. `npm start` runs the compiled output and therefore requires `npm run build` first.

In order to accept data from webhook providers, forward the port Skyhook binds to. It defaults to `8080`; set the `PORT` environment variable if another port is more convenient.

> If you are unable to forward a port you may use [ngrok](https://ngrok.com/).

Once the port is forwarded, you should be able to start the server and have it open for requests. You can validate this by going to `{your-public-ip}:8080`. If the skyhook webpage loads, then the port is forwarded correctly.

From here you should be able to [setup](https://github.com/Commit451/skyhook#setup) webooks through your local copy of skyhook. **Note that when setting up your webhooks you MUST replace `skyhookapi.com` with `{your-public-ip}:8080`.**

If your changes work, the provider's webhooks should be parsed and forwarded to discord. You can also write tests in the `test` directory, using the other tests as an example, to make sure your webhook parsing is working.

Each provider also needs one canonical payload under `examples/<provider>/` and one explicit definition in `src/provider/ProviderRegistry.ts`. Live routing, `/api/providers`, and the hosted example action all derive from that registry. Keep additional test-only payloads under `test/<provider>/`; see [Creating a provider](docs/CreateNewProvider.md) for the complete checklist.

