import { Events } from "discord.js";
import type { Event } from "../../types/index.js";

export default {
  name: Events.Warn,
  execute(info) {
    console.warn(info);
  },
} satisfies Event<Events.Warn>;
