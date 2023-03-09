import { book } from "@/server/api/routers/stop";
import type { BlockAction, ButtonAction } from "@slack/bolt";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";

type SlackPayload = BlockAction<ButtonAction>;

function bookHandler(action: ButtonAction, user: BlockAction["user"]) {
  book({
    userId: user.id,
    prisma,
    input: {
      stopId: action.value,
    },
  });
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const payload: SlackPayload = JSON.parse(req.body.payload);

  if (payload.actions?.length > 0) {
    payload.actions.map((action) => bookHandler(action, payload.user));
  }

  res.send({});
};
export default handler;
