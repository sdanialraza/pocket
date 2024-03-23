import type { Request } from "@cloudflare/workers-types/experimental";
import {
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  type API,
  type APIInteraction,
} from "@discordjs/core/http-only";
import { respond, verify, type Env } from "../util/index.js";
import { handleCommand, handleComponent, handleModal } from "./index.js";

export type Params = {
  api: API;
  env: Env;
  request: Request;
};

export async function handleRequest({ api, env, request }: Params): Promise<Response> {
  const isVerified = await verify(request, env);

  if (!isVerified) {
    return new Response("Unable to verify the request.", { status: 401 });
  }

  const interaction = await request.json<APIInteraction>();

  switch (interaction.type) {
    case InteractionType.ApplicationCommand:
      return handleCommand({ api, env, interaction });
    case InteractionType.ModalSubmit:
      return handleModal({ api, env, interaction });
    case InteractionType.MessageComponent:
      return handleComponent({ api, env, interaction });
    case InteractionType.Ping:
      return respond({ type: InteractionResponseType.Pong });
    default:
      return respond({
        data: { content: "To be implemented.", flags: MessageFlags.Ephemeral },
        type: InteractionResponseType.ChannelMessageWithSource,
      });
  }
}
