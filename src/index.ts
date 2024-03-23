import type { Request, ExecutionContext } from "@cloudflare/workers-types/experimental";
import { API } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { handleRequest } from "./handlers/index.js";
import type { Env } from "./util/index.js";

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const rest = new REST().setToken(env.DISCORD_TOKEN);

    const api = new API(rest);

    return handleRequest({ api, env, request });
  },
};
