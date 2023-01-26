# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Usage with Slack

1. Update `.env` file with the `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` values form the [Slack App Credentials page](https://api.slack.com/apps/A04L6MV7BUH)

> **Note**
> You should be a collaborator of the application to get the Slack id and secret. Ask @yoannfleurydev for access if you haven't one yet.

> **Note**
> Following commands are required only one time or when the certificate expires.

2. Install mkcert `brew install mkcert`
3. If you use Firefox `brew install nss`
4. `mkcert -install`
5. `pnpm ssl:generate` (will generate certificate that are .gitignored)
6. `pnpm dev`
7. Open https://localhost:3001 and enjoy HTTPS for localhost

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
