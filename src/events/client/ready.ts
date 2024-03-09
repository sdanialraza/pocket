import { Events } from "discord.js";
import type { Event } from "../../types/index.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.info(`Successfully logged in as ${client.user.username}`);
  },
} satisfies Event<Events.ClientReady>;
