import SlackNotify from "slack-notify";
import { env } from "@/env/server.mjs";

export const slack = SlackNotify(env.SLACK_WEBHOOK_URL);
