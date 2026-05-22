## Running with Google Cloud Run

After doing initial setup within https://cloud.google.com (project created, billing enabled, `gcloud` CLI authenticated against the right project), run:

```
npm run deploy
```

This invokes `gcloud run deploy` and builds the container from the project's `Dockerfile` via Cloud Build, then deploys it to the `skyhook` service in `us-central1`. Adjust the service name, region, or flags in `package.json` if needed.

To tail logs:

```
npm run logs
```
