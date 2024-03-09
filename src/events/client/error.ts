import { Events } from "discord.js";
import type { Event } from "../../types/index.js";

export default {
  name: Events.Error,
  execute(error) {
    console.error(error);
  },
} satisfies Event<Events.Error>;
