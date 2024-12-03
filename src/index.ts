import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get(
  "/",
  zValidator(
    "query",
    z.object({
      apiKey: z.string(),
      roomId: z.string(),
    })
  ),
  async (c) => {
    const { apiKey, roomId } = c.req.valid("query");

    console.log({ apiKey, roomId });

    const accessToken = new AccessToken({
      apiKey,
      roomId,
      //available roles: Role.HOST, Role.CO_HOST, Role.SPEAKER, Role.LISTENER, Role.GUEST - depending on the privileges you want to give to the user
      role: Role.HOST,
      //custom permissions give you more flexibility in terms of the user privileges than a pre-defined role
      permissions: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: {
          cam: true,
          mic: true,
          screen: true,
        },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
      options: {
        metadata: {
          // you can add any custom attributes here which you want to associate with the user
          walletAddress: "mizanxali.eth",
        },
      },
    });

    const token = await accessToken.toJwt();

    console.log({ token });

    return c.text(token);
  }
);

export default app;
