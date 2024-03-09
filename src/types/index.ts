import type { Collection } from "discord.js";
import type { Command } from "./command.js";

/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOOKMARKS_CHANNEL_ID: string;
      DISCORD_APPLICATION_ID: string;
      DISCORD_TOKEN: string;
    }
  }
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}

export type { Command } from "./command.js";
export type { Event } from "./event.js";
