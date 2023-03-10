import { book } from "@/server/api/routers/stop";
import type { BlockAction, ButtonAction } from "@slack/bolt";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { slackApp } from "@/server/slack";

type SlackPayload = BlockAction<ButtonAction>;

async function bookHandler(action: ButtonAction, slackPayload: SlackPayload) {
  const user = await prisma.account.findFirstOrThrow({
    where: {
      providerAccountId: slackPayload.user.id,
    },
    select: { userId: true },
  });

  try {
    await book({
      userId: user?.userId,
      prisma,
      input: {
        stopId: action.value,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      await fetch(slackPayload.response_url, {
        method: "POST",
        body: JSON.stringify({
          text: `❌ ${error.message}`,
          replace_original: false,
        }),
      });

      return;
    }
  }

  // TODO check if bolt can be used
  await fetch(slackPayload.response_url, {
    method: "POST",
    body: JSON.stringify({
      text: `✅ <@${slackPayload.user.id}> Your booking request has been sent to the driver`,
      replace_original: false,
    }),
  });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const payload: SlackPayload = JSON.parse(req.body.payload);

  if (payload.actions?.length > 0) {
    await Promise.all(
      payload.actions.map((action) => bookHandler(action, payload))
    );
  }

  res.send({});
};
export default handler;
